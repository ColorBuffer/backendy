
const UAParser = require('ua-parser-js')

module.exports = function Intelligent() {

    function parsedAgent(agent) {
        return UAParser(agent)
    }

    function parseCountry(ip) {

    }

    return {
        parsedAgent,
        parseCountry,
    }
}
