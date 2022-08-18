/*
 * GUN storage adapter for indexedDB
 * does not check the environment, if indexedDB not available returns null
 *
 * todo [OPEN]:
 *  - check and handle quotas
 *
 */

// no 'indexedBD' -> can't use this adapter
// if (!('indexedDB' in this)) return;

//
// constants
//

const WEBKIT_RESTART_INTERVAL = 15000; // 15 seconds
const VERSION_REOPEN_DELAY    =   350;

// if multiple DB's used keep their adapter instances
const Stores = {};

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
        // console.log("> start 1");
        var openDB = indexedDB.open(this.dbName, 1);
        // console.log("> start 2");

        openDB.onupgradeneeded = (evt) => {
            // console.log("> onupgradeneeded 1");
            const db = evt.target.result;
            // console.log("> onupgradeneeded createObjectStore");
            const store = db.createObjectStore(this.dbName, { keyPath: 'id' });
            // // console.log("> onupgradeneeded createIndex");
            // store.createIndex('id', 'id', { unique: true });
            // console.log("> onupgradeneeded 2");
        };
        openDB.onblocked = () => {
            // console.log("> onblocked");
            setTimeout(() => this.restart(), VERSION_REOPEN_DELAY);
        };
        openDB.onsuccess       = (evt) => {
            // console.log("> onsuccess 1");
            const db = this.db = evt.target.result;
            // add a handler for version change from another tab
            // this may block the DB and cause irregular behavior
            db.onversionchange = () => {
                // console.log("> onversionchange 1");
                const db = this.db;
                delete this.db;
                db.close();
                // try reopen after version change
                setTimeout(() => this.start(), VERSION_REOPEN_DELAY);
                // console.log("> onversionchange 2");
            };
            // this is an ugly workaround to reset webkit bug
            // if (window.webkitURL) this.restartIntervalId = setInterval(() => this.restart(), WEBKIT_RESTART_INTERVAL);

            // console.log("> onsuccess 2");
            this.processQs();
            // console.log("> onsuccess 3");
        }
        openDB.onerror         = (evt) => {
            // console.log('IndexedDB Error:', evt);
        }
        // console.log("> start 3");
    }

    //
    // base functions
    //

    put(key, data, cb) {
        const db = this.db;
        if (!db) {
            // console.log("> put wait 4 DB");
            this._putQ.push({ key, data, cb });
            return;
        }
        // console.log("> put 1");
        key = '' + key;     // sanitize

        // this.get(key, (ignore, exists) => {
        // console.log("> put 2");
        const transaction = this.db.transaction(this.dbName, 'readwrite');
        const store       = transaction.objectStore(this.dbName);
        // console.log("> put 3");
        //if (exists) {
        store.put({ id: key, payload: data });
        //} else {
        //    store.add({ id: key, payload: data });
        //}
        transaction.onabort    = (evt) => {
            // console.log("> put onabort");
            cb(evt || 'put.tx.abort');
        }
        transaction.onerror    = (evt) => {
            // console.log("> put onerror");
            cb(evt || 'put.tx.error');
        }
        transaction.oncomplete = (evt) => {
            // console.log("> put oncomplete");
            cb(null, 1);
        }
        // console.log("> put 4");
        // });
    }

    get(key, cb) {
        const db = this.db;
        if (!db) {
            // console.log("> get wait 4 DB");
            this._getQ.push({ key, cb });
            return;
        }
        // console.log("> get 1");
        key = '' + key;     // sanitize

        const request     = this.db
                                .transaction(this.dbName, 'readonly')
                                .objectStore(this.dbName)
                                .get(key);
        request.onabort   = (evt) => {
            // console.log("> get onabort");
            cb(evt || 4);
        }
        request.onerror   = (evt) => {
            // console.log("> get onerror");
            cb(evt || 5);
        }
        request.onsuccess = (evt) => {
            // console.log("> get onsuccess");
            cb(null, request.result?.payload);
        }
        // console.log("> get 2");
    }

    //
    // maintenance
    //

    restart() {
        // console.log("> restart 1");
        if (this.restartIntervalId) clearInterval(this.restartIntervalId);
        this.db?.close();
        delete this.db;
        this.start();
        // console.log("> restart 2");
    }

    //
    // process request queues
    //

    processQs() {
        // console.log("> processQs 1");
        this._putQ.forEach(({ key, data, cb }) => this.put(key, data, cb));
        // console.log("> processQs 2");
        setTimeout(() => this._getQ.forEach(({ key, cb }) => this.get(key, cb)), VERSION_REOPEN_DELAY);
        // console.log("> processQs 3");
    }
}

function createStore(opt) {
    opt      = opt || {};
    const dbName = opt.file = String(opt.file || 'neuland');
    if (Stores[dbName]) {
        // console.log("Warning: reusing same IndexedDB store and options as 1st.");
        return Stores[dbName];
    }

    const store = Stores[dbName] = new RIndexedStore(opt);
    store.start();
    return store;
}

export default createStore;
