"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const crypto_1 = require("crypto");
const webcrypto_js_1 = require("./webcrypto.js");
const crypto_key_js_1 = require("../lib/crypto_key.js");
const secret_key_js_1 = require("./secret_key.js");
const invalid_key_input_js_1 = require("../lib/invalid_key_input.js");

function getSignVerifyKey(alg, key, usage) {
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError((0, invalid_key_input_js_1.default)(key, 'KeyObject', 'CryptoKey'));
        }
        return (0, secret_key_js_1.default)(key);
    }
    if (key instanceof crypto_1.KeyObject) {
        return key;
    }
    if ((0, webcrypto_js_1.isCryptoKey)(key)) {
        (0, crypto_key_js_1.checkSigCryptoKey)(key, alg, usage);
        return crypto_1.KeyObject.from(key);
    }
    throw new TypeError((0, invalid_key_input_js_1.default)(key, 'KeyObject', 'CryptoKey', 'Uint8Array'));
}

exports.default = getSignVerifyKey;
