
const HashIds = require('hashids')

module.exports = function Identifier(config) {

    const hashIds = new HashIds(config.salt, config.minLength, config.alphabet)

    return {

        encode: function (id) {
            return hashIds.encode(parseInt(id + ''))
        },

        decode: function (code) {
            return hashIds.decode(code)[0]
        },

        validateCode: function (code) {
            return code.length >= config.minLength
        },
    }
}
