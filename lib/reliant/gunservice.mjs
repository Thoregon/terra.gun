/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse }               from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import * as Gun                     from '../../bower_components/gun/gun.js';
import * as path                    from '../../bower_components/gun/lib/path.js';
import * as not                     from '../../bower_components/gun/lib/not.js';
import * as unset                   from '../../bower_components/gun/lib/unset.js';

import * as Sea                     from '../../bower_components/gun/sea.js';

import * as Radix                   from '../../bower_components/gun/lib/radix.js';
import * as Rad                     from '../../bower_components/gun/lib/radisk.js';
import * as Store                   from '../../bower_components/gun/lib/store.js';
import * as RindexedDB              from '../../bower_components/gun/lib/rindexed.js';

const defaultpeers                  = ['http://localhost:8765/gun'];

export default class GunService  extends Reporter(EventEmitter) {

    constructor() {
        super();
    }

    /*
     * lifecycle
     */

    start() {
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

    /*
     * EventEmitter implementation
     */

    get publishes() {
        return {
            ready:          'GUN ready',
        };
    }

}
