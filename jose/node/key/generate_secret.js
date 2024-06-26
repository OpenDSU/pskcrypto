Object.defineProperty(exports, "__esModule", {value: true});
exports.generateSecret = void 0;
const generate_js_1 = require("../runtime/generate.js");

async function generateSecret(alg) {
    return (0, generate_js_1.generateSecret)(alg);
}

exports.generateSecret = generateSecret;
