/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { myterra }     from '/evolux.universe';


export const service = {
    install() {
        console.log('** gun install()');
        myterra().gun = new GunWrapper();
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
        myterra().gun.sync();
    },

    stop() {
        console.log('** gun stop()');
        myterra().matter.nosync();
    },

    update() {
        console.log('** matter update()');
    }
};
