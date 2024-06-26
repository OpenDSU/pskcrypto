const {flattenedDecrypt} = require('../flattened/decrypt.js');
const {JWEDecryptionFailed, JWEInvalid} = require('../../util/errors.js');
const isObject = require('../../lib/is_object.js');
module.exports.generalDecrypt = async function generalDecrypt(jwe, key, options) {
    if (!isObject(jwe)) {
        throw new JWEInvalid('General JWE must be an object');
    }
    if (!Array.isArray(jwe.recipients) || !jwe.recipients.every(isObject)) {
        throw new JWEInvalid('JWE Recipients missing or incorrect type');
    }
    for (const recipient of jwe.recipients) {
        try {
            return await flattenedDecrypt({
                aad: jwe.aad,
                ciphertext: jwe.ciphertext,
                encrypted_key: recipient.encrypted_key,
                header: recipient.header,
                iv: jwe.iv,
                protected: jwe.protected,
                tag: jwe.tag,
                unprotected: jwe.unprotected,
            }, key, options);
        } catch (_a) {
        }
    }
    throw new JWEDecryptionFailed();
}
