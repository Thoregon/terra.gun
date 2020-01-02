/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myterra }      from '/evolux.universe';
import GunService       from "./lib/reliant/gunservice.mjs";

export const service = {
    install() {
        console.log('** gun install()');
        myterra().gun = new GunService();
    },

    uninstall() {
        console.log('** gun uninstall()');
        delete myterra().gun;
    },

    resolve() {
        console.log('** gun resolve()');
        // nothing to do
    },

    start() {
        console.log('** gun start()');
        myterra().gun.start();
    },

    stop() {
        console.log('** gun stop()');
        // myterra().gun.exit();    // nothing to do; gun keeps syncing as long as the process is running
    },

    update() {
        console.log('** matter update()');
    }
};
