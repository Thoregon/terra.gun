/**
 *
 *
 * @author: Bernhard Lukassen
 */

import fs                           from '/fs';
import util                         from '/util';

import { myuniverse, tservices }    from "/evolux.universe";
import { EventEmitter}              from "/evolux.pubsub";
import { Reporter }                 from "/evolux.supervise";

import Gun                          from '/gun';

import seaext                       from "./seaext.mjs";

const defaultpeers                  = ['http://localhost:8765/gun'];

const exists                        = util.promisify(fs.exists);
const stat                          = util.promisify(fs.stat);
const readFile                      = util.promisify(fs.readFile);

let rafile = 'radata/!';

// don't move, works only directly after import of Gun
Gun.on('opt', function (context) {
    this.to.next(context);
});

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
        const opts = { peers };
        if (store) {
            opts.localStorage   = false;
            opts.store          = store;
        }
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        Gun.log.off = !myuniverse().GUNDEBUG;
        const gun = Gun(opts);
        // seaext(SEA);
        myuniverse().$gun = this.gun = gun;     // access later without $ -> universe.gun
        myuniverse().$Gun = Gun;                // access later without $ -> universe.Gun
        myuniverse().$nowfn = () => new Date(Gun.state());
        rafile = opts.file ? opts.file + '/!' : rafile;
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
        await import('../node_modules/gun/lib/erase.js');
        await import('../node_modules/gun/lib/forget.js');
        await import('../node_modules/gun/lib/open.js');
        await import('../node_modules/gun/lib/load.js');
        await import('../node_modules/gun/lib/then.js');
        await import('../node_modules/gun/lib/time.js');

        await import('../node_modules/gun/sea.js');
        await import('../node_modules/gun/nts.js');

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

    /*
     * gun dn specific functions
     */

    async objify() {
        let guncontent = new String(await readFile(rafile));
        return Gun.obj.ify(guncontent);
    }
}
