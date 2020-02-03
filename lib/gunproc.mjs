/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { Reporter }                 from "/evolux.supervise";

export default class GunProc extends Reporter() {

    async command(payload) {
        const cmd = payload.cmd;
        switch (cmd) {
            case 'create':
                break;
            default:
                this.logger.debug(`unknown command: '${cmd}`);
        }
    }

    async create() {

    }

    async put() {

    }

    async del() {

    }

    async get() {

    }

}
