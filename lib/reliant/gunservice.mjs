/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse, tservices }    from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import * as Gun                     from '../../node_modules/gun/gun.js';
import * as axe                     from '../../node_modules/gun/axe.js';
import * as path                    from '../../node_modules/gun/lib/path.js';
import * as not                     from '../../node_modules/gun/lib/not.js';
import * as unset                   from '../../node_modules/gun/lib/unset.js';
import * as erase                   from '../../node_modules/gun/lib/erase.js';
import * as forget                  from '../../node_modules/gun/lib/forget.js';
import * as open                    from '../../node_modules/gun/lib/open.js';
import * as load                    from '../../node_modules/gun/lib/load.js';
import * as then                    from '../../node_modules/gun/lib/then.js';
import * as time                    from '../../node_modules/gun/lib/time.js';

import * as Sea                     from '../../node_modules/gun/sea.js';
import * as NTS                     from '../../node_modules/gun/nts.js';

import * as Radix                   from '../../node_modules/gun/lib/radix.js';
import * as Rad                     from '../../node_modules/gun/lib/radisk.js';
import * as Store                   from '../../node_modules/gun/lib/store.js';
import * as RindexedDB              from '../../node_modules/gun/lib/rindexed.js';

const defaultpeers                  = ['http://localhost:8765/gun'];

export default class GunService  extends Reporter(EventEmitter) {

    constructor() {
        super();
    }

    /*
     * Service implementation
     */
    install() {
        this.logger.debug('** gun install()');
        tservices().gun = this;
    }

    uninstall() {
        this.logger.debug('** gun uninstall()');
        delete tservices().gun;
    }

    resolve() {
        this.logger.debug('** gun resolve()');
        // nothing to do
    }

    start() {
        this.logger.debug('** gun start()');
        const peers = myuniverse().gunpeers || defaultpeers;
        // const store = myuniverse().gunstore /* || defaultstore */;
        const opts = { peers, localStorage: false, store: globalThis.RindexedDB({}) };
        // if (store) {
        //     opts.localStorage   = false;
        //     opts.store          = store;
        // }
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        globalThis.Gun.log.off = !myuniverse().GUNDEBUG;
        const gun = globalThis.Gun(opts);
        myuniverse().$gun = this.gun = gun;     // access later without $ -> universe.gun
        myuniverse().$Gun = globalThis.Gun;     // access later without $ -> universe.Gun
        myuniverse().$nowfn = () => new Date(globalThis.Gun.state());
        this.emit('ready', { gunservice: this });
    }

    stop() {
        this.logger.debug('** gun stop()');
        // tservices().gun.exit();    // nothing to do; gun keeps syncing as long as the process is running
    }

    update() {
        this.logger.debug('** matter update()');
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
