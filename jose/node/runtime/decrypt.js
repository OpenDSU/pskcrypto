"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const crypto_1 = require("crypto");
const check_iv_length_js_1 = require("../lib/check_iv_length.js");
const check_cek_length_js_1 = require("./check_cek_length.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const errors_js_1 = require("../util/errors.js");
const timing_safe_equal_js_1 = require("./timing_safe_equal.js");
const cbc_tag_js_1 = require("./cbc_tag.js");
const webcrypto_js_1 = require("./webcrypto.js");
const crypto_key_js_1 = require("../lib/crypto_key.js");
const is_key_object_js_1 = require("./is_key_object.js");
const invalid_key_input_js_1 = require("../lib/invalid_key_input.js");
const ciphers_js_1 = require("./ciphers.js");

async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    if ((0, is_key_object_js_1.default)(cek)) {
        cek = cek.export();
    }
    const encKey = cek.subarray(keySize >> 3);
    const macKey = cek.subarray(0, keySize >> 3);
    const macSize = parseInt(enc.substr(-3), 10);
    const algorithm = `aes-${keySize}-cbc`;
    if (!(0, ciphers_js_1.default)(algorithm)) {
        throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
    }
    const expectedTag = (0, cbc_tag_js_1.default)(aad, iv, ciphertext, macSize, macKey, keySize);
    let macCheckPassed;
    try {
        macCheckPassed = (0, timing_safe_equal_js_1.default)(tag, expectedTag);
    } catch {
    }
    if (!macCheckPassed) {
        throw new errors_js_1.JWEDecryptionFailed();
    }
    let plaintext;
    try {
        const cipher = (0, crypto_1.createDecipheriv)(algorithm, encKey, iv);
        plaintext = (0, buffer_utils_js_1.concat)(cipher.update(ciphertext), cipher.final());
    } catch {
    }
    if (!plaintext) {
        throw new errors_js_1.JWEDecryptionFailed();
    }
    return plaintext;
}

async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const algorithm = `aes-${keySize}-gcm`;
    if (!(0, ciphers_js_1.default)(algorithm)) {
        throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
    }
    try {
        const cipher = (0, crypto_1.createDecipheriv)(algorithm, cek, iv, {authTagLength: 16});
        cipher.setAuthTag(tag);
        if (aad.byteLength) {
            cipher.setAAD(aad, {plaintextLength: ciphertext.length});
        }
        return (0, buffer_utils_js_1.concat)(cipher.update(ciphertext), cipher.final());
    } catch {
        throw new errors_js_1.JWEDecryptionFailed();
    }
}

const decrypt = async (enc, cek, ciphertext, iv, tag, aad) => {
    let key;
    if ((0, webcrypto_js_1.isCryptoKey)(cek)) {
        (0, crypto_key_js_1.checkEncCryptoKey)(cek, enc, 'decrypt');
        key = crypto_1.KeyObject.from(cek);
    } else if (cek instanceof Uint8Array || (0, is_key_object_js_1.default)(cek)) {
        key = cek;
    } else {
        throw new TypeError((0, invalid_key_input_js_1.default)(cek, 'KeyObject', 'CryptoKey', 'Uint8Array'));
    }
    (0, check_cek_length_js_1.default)(enc, key);
    (0, check_iv_length_js_1.default)(enc, iv);
    switch (enc) {
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            return cbcDecrypt(enc, key, ciphertext, iv, tag, aad);
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            return gcmDecrypt(enc, key, ciphertext, iv, tag, aad);
        default:
            throw new errors_js_1.JOSENotSupported('Unsupported JWE Content Encryption Algorithm');
    }
};
exports.default = decrypt;
