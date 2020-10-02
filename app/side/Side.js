
const Camera      = require('./camera/Camera');
const Intelligent = require('./intel/Intelligent');

module.exports = function Side(config) {

    const camera      = Camera({
        sqipPath: __dirname + '/app/sqip.js',
    })
    const intelligent = Intelligent()

    return {
        camera,
        intelligent,
    }
}