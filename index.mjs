/**
 *
 *
 * @author: Bernhard Lukassen
 */


export { default as GunLayer }  from './lib/gunlayer.mjs';
export { default as Gun }       from '/gun';

import GunService               from "./lib/gunservice.mjs";
export const service =          new GunService();
