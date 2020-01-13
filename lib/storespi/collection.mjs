/**
 *
 *
 * @author: Bernhard Lukassen
 */

export default class Collection {

    constructor({
                    name,
                    description,
                    indexes = []
                } = {}) {
        Object.assign(this, {id});
    }

}
