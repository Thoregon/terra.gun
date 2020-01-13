/**
 *
 *
 * @author: Bernhard Lukassen
 */

export { default as GunLayer }  from './lib/gunlayer.mjs';

import GunService               from "./lib/gunservice.mjs";
export const service =          new GunService();
