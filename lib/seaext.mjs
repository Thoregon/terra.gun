/**
 *
 *
 * @author: Bernhard Lukassen
 */

// todo [OPEN]: import 'shim' !!

export default (SEA) => {
    /**
     * decrypt with a public key
     */
    SEA.sdecrypt = SEA.sdecrypt || (async (data, key, s, iv) => {
        try {
            var json = S.parse(data);
            var aes  = await aeskey(key, shim.Buffer.from(s), {});
            var ct   = await shim.subtle.decrypt({
                                                     name: 'AES-GCM',
                                                     iv  : new Uint8Array(shim.Buffer.from(iv))
                                                 }, aes, new Uint8Array(shim.Buffer.from(data, 'base64')));
            var r    = S.parse(new shim.TextDecoder('utf8').decode(ct));
            return r;
        } catch (e) {
            console.log(e);
            SEA.err = e;
            if (SEA.throw) throw e;
        }
    });

    /**
     * encrypt with a private key
     */
    SEA.sencrypt = SEA.sencrypt || (async (data, key, s, iv) => {
        try {
            if (u === data) {
                throw '`undefined` not allowed.'
            }
            var msg = (typeof data == 'string') ? data : JSON.stringify(data);
            var aes = await aeskey(key, shim.Buffer.from(s), {});
            var ct  = await shim.subtle.encrypt({
                                                    name: 'AES-GCM',
                                                    iv  : new Uint8Array(shim.Buffer.from(iv))
                                                }, aes, new shim.TextEncoder().encode(msg));
            var r   = shim.Buffer.from(ct, 'binary').toString('base64');
            return r;
        } catch (e) {
            console.log(e);
            SEA.err = e;
            if (SEA.throw) throw e;
        }
    });


}
