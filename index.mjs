/**
 *
 *
 * @author: Bernhard Lukassen
 */

export { default as Gun }       from './gun/gun.js';

import GunService               from "./lib/gunservice.mjs";
export const service =          new GunService();
