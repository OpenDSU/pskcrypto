class JOSEError extends Error {
    constructor(message) {
        let _a;
        super(message);
        this.code = 'ERR_JOSE_GENERIC';
        this.name = this.constructor.name;
        (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, this.constructor);
    }

    static get code() {
        return 'ERR_JOSE_GENERIC';
    }
}

class JWTClaimValidationFailed extends JOSEError {
    constructor(message, claim = 'unspecified', reason = 'unspecified') {
        super(message);
        this.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
        this.claim = claim;
        this.reason = reason;
    }

    static get code() {
        return 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    }
}

class JWTExpired extends JOSEError {
    constructor(message, claim = 'unspecified', reason = 'unspecified') {
        super(message);
        this.code = 'ERR_JWT_EXPIRED';
        this.claim = claim;
        this.reason = reason;
    }

    static get code() {
        return 'ERR_JWT_EXPIRED';
    }
}

class JOSEAlgNotAllowed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    }

    static get code() {
        return 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
}

class JOSENotSupported extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JOSE_NOT_SUPPORTED';
    }

    static get code() {
        return 'ERR_JOSE_NOT_SUPPORTED';
    }
}

class JWEDecryptionFailed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWE_DECRYPTION_FAILED';
        this.message = 'decryption operation failed';
    }

    static get code() {
        return 'ERR_JWE_DECRYPTION_FAILED';
    }
}

class JWEInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWE_INVALID';
    }

    static get code() {
        return 'ERR_JWE_INVALID';
    }
}

class JWSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWS_INVALID';
    }

    static get code() {
        return 'ERR_JWS_INVALID';
    }
}

class JWTInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWT_INVALID';
    }

    static get code() {
        return 'ERR_JWT_INVALID';
    }
}

class JWKInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWK_INVALID';
    }

    static get code() {
        return 'ERR_JWK_INVALID';
    }
}

class JWKSInvalid extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_INVALID';
    }

    static get code() {
        return 'ERR_JWKS_INVALID';
    }
}

class JWKSNoMatchingKey extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_NO_MATCHING_KEY';
        this.message = 'no applicable key found in the JSON Web Key Set';
    }

    static get code() {
        return 'ERR_JWKS_NO_MATCHING_KEY';
    }
}

class JWKSMultipleMatchingKeys extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
        this.message = 'multiple matching keys found in the JSON Web Key Set';
    }

    static get code() {
        return 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    }
}

class JWKSTimeout extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWKS_TIMEOUT';
        this.message = 'request timed out';
    }

    static get code() {
        return 'ERR_JWKS_TIMEOUT';
    }
}

class JWSSignatureVerificationFailed extends JOSEError {
    constructor() {
        super(...arguments);
        this.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
        this.message = 'signature verification failed';
    }

    static get code() {
        return 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    }
}

module.exports = {
    JOSEError,
    JWTClaimValidationFailed,
    JWTExpired,
    JOSEAlgNotAllowed,
    JOSENotSupported,
    JWEDecryptionFailed,
    JWEInvalid,
    JWSInvalid,
    JWTInvalid,
    JWKInvalid,
    JWKSInvalid,
    JWKSNoMatchingKey,
    JWKSMultipleMatchingKeys,
    JWKSTimeout,
    JWSSignatureVerificationFailed
}