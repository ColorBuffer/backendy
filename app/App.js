
const Data  = require('./data/Data')
const Server = require('./server/Server')
const Side = require('./side/Side')
const Web = require('./web/Web')

module.exports = async function App(config) {

    const side = Side(config.side)

    const data = await Data(config.data, side)
    
    const server = await Server(data, config.server, config.controllers)

    const web = Web(config.web)

}
