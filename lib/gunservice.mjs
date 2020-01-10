/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myuniverse, tservices }    from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import Gun                          from '/gun';

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

    async start() {
        this.logger.debug('** gun start()');

        await this.importGunFeatures();

        const peers = myuniverse().gunpeers || defaultpeers;
        const store = myuniverse().gunstore /* || defaultstore */;
        const opts = { peers, log: () =>{} };
        if (store) {
            opts.localStorage   = false;
            opts.store          = store;
        }
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        const gun = Gun(opts);
        myuniverse().gun = this.gun = gun;
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
     * gun features
     */

    async importGunFeatures() {
        await import('../node_modules/gun/lib/path.js');
        await import('../node_modules/gun/lib/not.js');
        await import('../node_modules/gun/lib/unset.js');

        await import('../node_modules/gun/sea.js');

        await import('../node_modules/gun/lib/radix.js');
        await import('../node_modules/gun/lib/store.js');
        await import('../node_modules/gun/lib/radisk.js');
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
