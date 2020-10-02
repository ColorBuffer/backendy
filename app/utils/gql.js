
module.exports = function gql(strings, ...joints) {
    let out = ''
    for (let i in strings) {
        out += strings[i]
        if (joints[i]) 
            out += joints[i]
    }
    return out
}