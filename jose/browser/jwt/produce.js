const epoch = require('../lib/epoch.js');
const isObject = require('../lib/is_object.js');
const secs = require('../lib/secs.js');

class ProduceJWT {
    constructor(payload) {
        if (!isObject(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this._payload = payload;
    }

    setIssuer(issuer) {
        this._payload = {...this._payload, iss: issuer};
        return this;
    }

    setSubject(subject) {
        this._payload = {...this._payload, sub: subject};
        return this;
    }

    setAudience(audience) {
        this._payload = {...this._payload, aud: audience};
        return this;
    }

    setJti(jwtId) {
        this._payload = {...this._payload, jti: jwtId};
        return this;
    }

    setNotBefore(input) {
        if (typeof input === 'number') {
            this._payload = {...this._payload, nbf: input};
        } else {
            this._payload = {...this._payload, nbf: epoch(new Date()) + secs(input)};
        }
        return this;
    }

    setExpirationTime(input) {
        if (typeof input === 'number') {
            this._payload = {...this._payload, exp: input};
        } else {
            this._payload = {...this._payload, exp: epoch(new Date()) + secs(input)};
        }
        return this;
    }

    setIssuedAt(input) {
        if (typeof input === 'undefined') {
            this._payload = {...this._payload, iat: epoch(new Date())};
        } else {
            this._payload = {...this._payload, iat: input};
        }
        return this;
    }
}

module.exports.ProduceJWT = ProduceJWT;