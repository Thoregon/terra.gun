/*
 * GUN storage adapter for indexedDB
 * does not check the environment, if indexedDB not available returns null
 *
 * todo [OPEN]:
 *  - check and handle quotas
 *
 */

// no 'indexedBD' -> can't use this adapter
if (!('indexedDB' in this)) return;

//
// constants
//

const WEBKIT_RESTART_INTERVAL = 15000; // 15 seconds
const VERSION_REOPEN_DELAY    =   350;

// if multiple DB's used keep their adapter instances
const Stores = {};

/**
 * storage adapter
 *
 * further information:
 * - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 * - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology
 * - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 *
 * To consider (reported problems):
 * - https://www.nerd.vision/post/how-we-solved-a-case-where-indexeddb-did-not-connect
 * - https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#version_changes_while_a_web_app_is_open_in_another_tab
 * - https://stackoverflow.com/questions/30580958/database-get-blocked-when-another-tab-of-same-application-is-open
 * - https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a
 * - https://www.raymondcamden.com/2015/04/17/indexeddb-and-limits
 */
class RIndexedStore {

    constructor(opt) {
        this.opt    = opt;
        this.dbName = opt.file;
        this._getQ  = [];    // keep 'get' request until the DB is ready
        this._putQ  = [];    // keep 'put' request until the DB is ready
    }

    /**
     * Open an indexed DB
     * Create a store if missing
     * Handle exceptions and bugs
     */
    start() {
        var openDB = indexedDB.open(this.dbName, 1);

        openDB.onupgradeneeded = (evt) => {
            const db = evt.target.result;
            const store = db.createObjectStore(opt.file);
            store.createIndex('id', 'id', { unique: true });
        };
        openDB.onblocked = () => {
            setTimeout(() => this.restart(), VERSION_REOPEN_DELAY);
        };
        openDB.onsuccess       = (evt) => {
            const db = this.db = ev.target.result;
            // add a handler for version change from another tab
            // this may block the DB and cause irregular behavior
            db.onversionchange = () => {
                const db = this.db;
                delete this.db;
                db.close();
                // try reopen after version change
                setTimeout(() => this.start(), VERSION_REOPEN_DELAY);
            };
            // this is an ugly workaround to reset webkit bug
            if (window.webkitURL) this.restartIntervalId = setInterval(() => this.restart(), WEBKIT_RESTART_INTERVAL);

            this.processQs();
        }
        openDB.onerror         = (evt) => {
            console.log('IndexedDB Error:', evt);
        }
    }

    //
    // base functions
    //

    put(key, data, cb) {
        const db = this.db;
        if (!db) {
            this._putQ.push({ key, data, cb });
            return;
        }
        key = '' + key;     // sanitize

        this.get(key, (ignore, exists) => {
            const transaction = this.db.transaction(this.dbName, 'readwrite');
            const store       = transaction.objectStore(this.dbName);
            if (exists) {
                store.put({ id: key, payload: data });
            } else {
                store.add({ id: key, payload: data });
            }
            transaction.onabort    = (evt) => cb(evt || 'put.tx.abort');
            transaction.onerror    = (evt) => cb(evt || 'put.tx.error');
            transaction.oncomplete = (evt) => cb(null, 1);
        });
    }

    get(key, cb) {
        const db = this.db;
        if (!db) {
            this._getQ.push({ key, cb });
            return;
        }
        key = '' + key;     // sanitize

        const request     = this.db
                                .transaction(this.dbName, 'readonly')
                                .objectStore(this.dbName)
                                .get(key);
        request.onabort   = cb(evt || 4);
        request.onerror   = cb(evt || 5);
        request.onsuccess = (ev) => cb(null, req.result?.payload);
    }

    //
    // maintenance
    //

    restart() {
        if (this.restartIntervalId) clearInterval(this.restartIntervalId);
        this.db?.close();
        delete this.db;
        this.start();
    }

    //
    // process request queues
    //

    processQs() {
        this._getQ.forEach(({ key, cb }) => this.get(key, cb));
        this._putQ.forEach(({ key, data, cb }) => this.put(key, data, cb));
    }
}

function createStore(opt) {
    opt      = opt || {};
    const dbName = opt.file = String(opt.file || 'radata');
    if (Stores[dbName]) {
        console.log("Warning: reusing same IndexedDB store and options as 1st.");
        return Stores[dbName];
    }

    const store = Stores[dbName] = new RIndexedStore(opt);
    store.start();
    return store;
}

try {
    const Gun = window.Gun;
    Gun.on('create', function (root) {
        this.to.next(root);
        root.opt.store = root.opt.store || createStore(root.opt);
    });
} catch (e) {
    console.loe("Can't create RIndexedDB storage adapter");
}

// export if 'required'
try { module.exports = createStore } catch (e) {}
