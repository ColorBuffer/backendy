
function snakeToCamel(string) {
    const pascal = snakeToPascal(string)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function snakeToPascal(string) {
    return string.split('_').map(ucFirst).join('')
}

function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function merge(array) {
    return array.reduce((prev, current) => ({...prev, ...current}), {})
}

function camelToSnake(string) {
    var upperChars = string.match(/([A-Z])/g)
    if (!upperChars) return string

    var str = string.toString()
    for (var i = 0, n = upperChars.length; i < n; i++) {
        str = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase())
    }

    if (str.slice(0, 1) === '_') {
        str = str.slice(1)
    }

    return str
}

module.exports = {
    snakeToCamel,
    snakeToPascal,
    camelToSnake,
    merge,
}