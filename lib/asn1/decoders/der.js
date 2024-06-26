let inherits = require('util').inherits;

let asn1 = require('../asn1');
let base = asn1.base;
let bignum = asn1.bignum;

// Import DER constants
let der = asn1.constants.der;

function DERDecoder(entity) {
    this.enc = 'der';
    this.name = entity.name;
    this.entity = entity;

    // Construct base tree
    this.tree = new DERNode();
    this.tree._init(entity.body);
}

module.exports = DERDecoder;

DERDecoder.prototype.decode = function decode(data, options) {
    if (!(data instanceof base.DecoderBuffer))
        data = new base.DecoderBuffer(data, options);

    return this.tree._decode(data, options);
};

// Tree methods

function DERNode(parent) {
    base.Node.call(this, 'der', parent);
}

inherits(DERNode, base.Node);

DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
    if (buffer.isEmpty())
        return false;

    let state = buffer.save();
    let decodedTag = derDecodeTag(buffer, 'Failed to peek tag: "' + tag + '"');
    if (buffer.isError(decodedTag))
        return decodedTag;

    buffer.restore(state);

    return decodedTag.tag === tag || decodedTag.tagStr === tag || any;
};

DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
    let decodedTag = derDecodeTag(buffer,
        'Failed to decode tag of "' + tag + '"');
    if (buffer.isError(decodedTag))
        return decodedTag;

    let len = derDecodeLen(buffer,
        decodedTag.primitive,
        'Failed to get length of "' + tag + '"');

    // Failure
    if (buffer.isError(len))
        return len;

    if (!any &&
        decodedTag.tag !== tag &&
        decodedTag.tagStr !== tag &&
        decodedTag.tagStr + 'of' !== tag) {
        return buffer.error('Failed to match tag: "' + tag + '"');
    }

    if (decodedTag.primitive || len !== null)
        return buffer.skip(len, 'Failed to match body of: "' + tag + '"');

    // Indefinite length... find END tag
    let state = buffer.save();
    let res = this._skipUntilEnd(
        buffer,
        'Failed to skip indefinite length body: "' + this.tag + '"');
    if (buffer.isError(res))
        return res;

    len = buffer.offset - state.offset;
    buffer.restore(state);
    return buffer.skip(len, 'Failed to match body of: "' + tag + '"');
};

DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
    while (true) {
        let tag = derDecodeTag(buffer, fail);
        if (buffer.isError(tag))
            return tag;
        let len = derDecodeLen(buffer, tag.primitive, fail);
        if (buffer.isError(len))
            return len;

        let res;
        if (tag.primitive || len !== null)
            res = buffer.skip(len)
        else
            res = this._skipUntilEnd(buffer, fail);

        // Failure
        if (buffer.isError(res))
            return res;

        if (tag.tagStr === 'end')
            break;
    }
};

DERNode.prototype._decodeList = function decodeList(buffer, tag, decoder) {
    let result = [];
    while (!buffer.isEmpty()) {
        let possibleEnd = this._peekTag(buffer, 'end');
        if (buffer.isError(possibleEnd))
            return possibleEnd;

        let res = decoder.decode(buffer, 'der');
        if (buffer.isError(res) && possibleEnd)
            break;
        result.push(res);
    }
    return result;
};

DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
    if (tag === 'octstr') {
        return buffer.raw();
    } else if (tag === 'bitstr') {
        let unused = buffer.readUInt8();
        if (buffer.isError(unused))
            return unused;

        return {unused: unused, data: buffer.raw()};
    } else if (tag === 'ia5str' || tag === 'utf8str') {
        return buffer.raw().toString();
    } else {
        return this.error('Decoding of string type: ' + tag + ' unsupported');
    }
};

DERNode.prototype._decodeObjid = function decodeObjid(buffer, values, relative) {
    let identifiers = [];
    let ident = 0;
    let subident;
    while (!buffer.isEmpty()) {
        subident = buffer.readUInt8();
        ident <<= 7;
        ident |= subident & 0x7f;
        if ((subident & 0x80) === 0) {
            identifiers.push(ident);
            ident = 0;
        }
    }
    if (subident & 0x80)
        identifiers.push(ident);

    let first = (identifiers[0] / 40) | 0;
    let second = identifiers[0] % 40;
    let result;
    if (relative)
        result = identifiers;
    else
        result = [first, second].concat(identifiers.slice(1));

    if (values)
        result = values[result.join(' ')];

    return result;
};

DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
    let str = buffer.raw().toString();
    let year, mon, day, hour, min, sec;
    if (tag === 'gentime') {
        year = str.slice(0, 4) | 0;
        mon = str.slice(4, 6) | 0;
        day = str.slice(6, 8) | 0;
        hour = str.slice(8, 10) | 0;
        min = str.slice(10, 12) | 0;
        sec = str.slice(12, 14) | 0;
    } else if (tag === 'utctime') {
        year = str.slice(0, 2) | 0;
        mon = str.slice(2, 4) | 0;
        day = str.slice(4, 6) | 0;
        hour = str.slice(6, 8) | 0;
        min = str.slice(8, 10) | 0;
        sec = str.slice(10, 12) | 0;
        if (year < 70)
            year = 2000 + year;
        else
            year = 1900 + year;
    } else {
        return this.error('Decoding ' + tag + ' time is not supported yet');
    }

    return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
};

DERNode.prototype._decodeNull = function decodeNull() {
    return null;
};

DERNode.prototype._decodeBool = function decodeBool(buffer) {
    let res = buffer.readUInt8();
    if (buffer.isError(res))
        return res;
    else
        return res !== 0;
};

DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
    // Bigint, return as it is (assume big endian)
    let raw = buffer.raw();
    let res = new bignum(raw);

    if (values)
        res = values[res.toString(10)] || res;

    return res;
};

DERNode.prototype._use = function use(entity, obj) {
    if (typeof entity === 'function')
        entity = entity(obj);
    return entity._getDecoder('der').tree;
};

// Utility methods

function derDecodeTag(buf, fail) {
    let tag = buf.readUInt8(fail);
    if (buf.isError(tag))
        return tag;

    let cls = der.tagClass[tag >> 6];
    let primitive = (tag & 0x20) === 0;

    // Multi-octet tag - load
    if ((tag & 0x1f) === 0x1f) {
        let oct = tag;
        tag = 0;
        while ((oct & 0x80) === 0x80) {
            oct = buf.readUInt8(fail);
            if (buf.isError(oct))
                return oct;

            tag <<= 7;
            tag |= oct & 0x7f;
        }
    } else {
        tag &= 0x1f;
    }
    let tagStr = der.tag[tag];

    return {
        cls: cls,
        primitive: primitive,
        tag: tag,
        tagStr: tagStr
    };
}

function derDecodeLen(buf, primitive, fail) {
    let len = buf.readUInt8(fail);
    if (buf.isError(len))
        return len;

    // Indefinite form
    if (!primitive && len === 0x80)
        return null;

    // Definite form
    if ((len & 0x80) === 0) {
        // Short form
        return len;
    }

    // Long form
    let num = len & 0x7f;
    if (num >= 4)
        return buf.error('length octect is too long');

    len = 0;
    for (let i = 0; i < num; i++) {
        len <<= 8;
        let j = buf.readUInt8(fail);
        if (buf.isError(j))
            return j;
        len |= j;
    }

    return len;
}
