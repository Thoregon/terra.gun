/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse }               from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import Gun                          from '/gun';

const defaultpeers                  = ['http://localhost:8765/gun'];

/*
const defaultstore = {};
defaultstore.put = (file, data, cb) => { cb(undefined, 1); };
defaultstore.get = (file, cb) => { cb(undefined); };
defaultstore.list = (cb) => { cb(); };
*/

export default class GunService  extends Reporter(EventEmitter) {

    constructor() {
        super();
    }

    /*
     * lifecycle
     */

    start() {
        const peers = myuniverse().gunpeers || defaultpeers;
        const store = myuniverse().gunstore /* || defaultstore */;
        const opts = { peers };
        if (store) {
            opts.localStorage   = false;
            opts.store          = store;
        }
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        const gun = Gun(opts);
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
