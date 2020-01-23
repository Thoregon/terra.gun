/**
 * Deprecated, use gun direct without a layer infrastructure
 *
 * @author: Bernhard Lukassen
 */

import { doAsync }      from '/evolux.universe'
import { Layer }        from '/evolux.dynlayers';
import GunProc          from './gunproc.mjs';

export default class GunLayer extends Layer {

    constructor() {
        super(...arguments);
        this.proc = new GunProc();
    }

    // process data 'downwards' and return the result
    async send(request, response, layers) {
        this.layers =       layers;       // memorize the layers processor for receive
        const payload =     request.payload;
        this.stackname =    request.meta.name;

        if (payload.cmd === 'ping') return this._pong(payload);

        let result = await this.proc.command(payload);
        response.done();
    }

    // process data 'upwards' and return the result
    async receive(request, response) {

    }

    // **** test

    _pong(payload) {
        setTimeout(async () => {
            let answer = Object.assign({}, payload);
            answer.pong = true;
            const res = await this.layers.processReceive(this.stackname, payload);
        }, 0);
    }
}
