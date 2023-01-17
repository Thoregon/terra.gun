/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { tservices }                from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import * as Gun                     from '../../gun/gun.js';
//import * as yson                    from '../../gun/lib/yson.js';
import * as not                     from '../../gun/lib/not.js';
import * as unset                   from '../../gun/lib/unset.js';
// import * as axe                     from '../../gun/axe.js';
// import * as path                    from '../../gun/lib/path.js';
// import * as erase                   from '../../gun/lib/erase.js';
// import * as forget                  from '../../gun/lib/forget.js';
// import * as open                    from '../../gun/lib/open.js';
// import * as load                    from '../../gun/lib/load.js';
// import * as then                    from '../../gun/lib/then.js';
// import * as time                    from '../../gun/lib/time.js';

import * as Sea                     from '../../gun/sea.js';
import * as NTS                     from '../../gun/nts.js';

import * as Radix                   from '../../gun/lib/radix.js';
import * as Rad                     from '../../gun/lib/radisk.js';
import * as Store                   from '../../gun/lib/store.js';

import createRindexedDB              from '../../gun/lib/rindexed.mjs';

// import seaext                       from "../seaext.mjs";

const defaultpeers                  = ['http://localhost:8765/gun'];

const gunadapter = {
    node(request) {
        this.to.next(request);
    },

    // check for DNS (denial of service) attacks
    in(request) {
        this.to.next(request);
    },

    // not utilized, needs no processing
    out(request) {
        this.to.next(request);
    },

    // encrypt
    put(request) {
        this.to.next(request);
    },

    // decrypt
    get(request) {
        this.to.next(request);
    }
}

// don't move, works only directly after import of Gun
window.Gun.on('opt', function (context) {
    if(!context.thoregon){ // only add once per instance, on the "at" context.
        context.thoregon = gunadapter;
        gunadapter.at = context;
        context.on('in', gunadapter.in, context);
        context.on('out', gunadapter.out, context);
        context.on('node', gunadapter.node, context);
        context.on('put', gunadapter.put, context);
        context.on('get', gunadapter.get, context);
    }
    this.to.next(context); // make sure to call the "next" middleware adapter.
});

export default class GunService extends Reporter(EventEmitter) {

    constructor() {
        super();
    }

    /*
     * Service implementation
     */
    install() {
        // this.logger.debug('** gun install()');
        tservices().gun = this;
    }

    uninstall() {
        // this.logger.debug('** gun uninstall()');
        delete tservices().gun;
    }

    resolve() {
        // this.logger.debug('** gun resolve()');
        // nothing to do
    }

    start() {
        // this.logger.debug('** gun start()');
        const peers = universe.gunpeers || defaultpeers;
        // const store = universe.gunstore /* || defaultstore */;
        // indexed DB was very slow
        const opt = { peers: [...peers], localStorage: false };
        let  store = createRindexedDB(opt);
        opt.store = store;
        // const opts = { peers: [...peers] };
        // if (store) {
        //     opts.localStorage   = false;
        //     opts.store          = store;
        // }
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        window.Gun.log.off = !universe.GUNDEBUG;
        const gun = window.Gun(opt);
        // window.gun = gun; // uncomment just for testing
        // seaext(SEA)
        universe.$gun = this.gun = gun;     // access later without $ -> universe.gun
        universe.$Gun = window.Gun;     // access later without $ -> universe.Gun
        universe.$nowfn = () => window.Gun.state();
        this.emit('ready', { gunservice: this });
    }

    stop() {
        // this.logger.debug('** gun stop()');
        // tservices().gun.exit();    // nothing to do; gun keeps syncing as long as the process is running
    }

    update() {
        // this.logger.debug('** matter update()');
    }

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'GUN ready',
        };
    }

    /*
     * gun dn specific functions
     */

    objify() {
        return new Promise((resolve, reject) => {
            let Gun = universe.Gun;
            let db = indexedDB.open("radata");
            db.onsuccess = () => {
                let ra = db.result;
                ra.transaction("radata").objectStore("radata").get("!").onsuccess = (ev) => {
                    if (ev.type !== 'success') reject('gun db empty');
                    resolve(Gun.obj.ify(ev.target.result));
                }
            }
        });
    }

}
