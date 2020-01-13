/**
 *
 *
 * @author: Bernhard Lukassen
 */

import { Layer }        from '/evolux.dynlayers';

export default class GunLayer extends Layer {

    constructor({
                    id
                } = {}) {
        super();
        Object.assign(this, {id});
    }

    // process data 'downwards' and return the result
    send(request, response) {

    }

    // process data 'upwards' and return the result
    receive(request, response) {

    }

}
