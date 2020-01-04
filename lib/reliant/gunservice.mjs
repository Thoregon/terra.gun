/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse, myterra }      from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import * as Gun                     from '../../node_modules/gun/gun.js';
import * as axe                     from '../../node_modules/gun/axe.js';
import * as path                    from '../../node_modules/gun/lib/path.js';
import * as not                     from '../../node_modules/gun/lib/not.js';
import * as unset                   from '../../node_modules/gun/lib/unset.js';

import * as Sea                     from '../../node_modules/gun/sea.js';

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
        myterra().gun = this;
    }

    uninstall() {
        this.logger.debug('** gun uninstall()');
        delete myterra().gun;
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
        const gun = globalThis.Gun(opts);
        myuniverse().gun = this.gun = gun;
        this.emit('ready', { gunservice: this });
    }

    stop() {
        this.logger.debug('** gun stop()');
        // myterra().gun.exit();    // nothing to do; gun keeps syncing as long as the process is running
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

}
