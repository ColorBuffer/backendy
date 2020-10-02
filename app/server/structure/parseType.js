
module.exports = function parseType(typeString) {
    let [type, unsigned] = typeString.split(' ')
    let size = null
    const p = type.indexOf('(')
    if (p !== -1) {
        size = type.substring(p + 1, type.length - 1)
        type = type.substring(0, p)
    }

    unsigned = unsigned || 'signed'

    return {type, unsigned, size}
}