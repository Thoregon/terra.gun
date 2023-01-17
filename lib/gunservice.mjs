/**
 *
 *
 * @author: Bernhard Lukassen
 */

import fs               from '/fs';
import util             from '/util';
import WebSocket        from '/ws';

import { tservices }    from "/evolux.universe";
import { EventEmitter } from "/evolux.pubsub";
import { Reporter }     from "/evolux.supervise";

import Gun              from '../gun/gun.js';

const defaultpeers = ['http://localhost:8765/gun'];

const exists       = util.promisify(fs.exists);
const stat         = util.promisify(fs.stat);
const readFile     = util.promisify(fs.readFile);

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

        const rfs = await this.importGunFeatures();

        const peers = [...universe.gunpeers] || defaultpeers;
        let   store = universe.gunstore /* || defaultstore */;
        let   opt  = { peers };
        if (store) {
            // don't use object composition/decomposition! opts must remain the same object
            opt.localStorage = false;
            opt.store        = store;
        } else {
            // don't use object composition/decomposition! opts must remain the same object
            opt.localStorage = true;
            opt.radisk       = true;
            opt.store        = rfs(opt);
        }
        opt.WebSocket = WebSocket;
        // todo: start local gun signaling server if peers contains 'localhost' or default peers are used
        Gun.log.off = !universe.GUNDEBUG;
        const gun = Gun(opt);
        // seaext(SEA);
        universe.$gun = this.gun = gun;     // access later without $ -> universe.gun
        universe.$Gun = Gun;                // access later without $ -> universe.Gun
        universe.global('Gun');
        universe.$nowfn = () => Gun.state();
        rafile = opt.file ? opt.file + '/!' : rafile;
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
//        await import('../gun/lib/yson.js');
        // await import('../gun/lib/path.js');
        await import('../gun/lib/not.js');
        await import('../gun/lib/unset.js');
        // await import('../gun/lib/then.js');
        // await import('../gun/lib/time.js');
        // await import('../gun/lib/erase.js');
        // await import('../gun/lib/forget.js');
        // await import('../gun/lib/open.js');
        // // await import('../gun/lib/load.js');

        await import('../gun/sea.js');
        // await import('../gun/nts.js');   //  deprecated -> use DAM

        const rfs = (await import('../gun/lib/rfs.js')).default;
        await import('../gun/lib/store.js');
        await import('../gun/lib/radix.js');
        await import('../gun/lib/radisk.js');

        return rfs;
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
