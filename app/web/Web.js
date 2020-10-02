
const Next   = require('next')
const path   = require('path')
const Server = require('./server/Server')

module.exports = async function Web({dev, port}) {

    const next = Next({
        dev,
        dir: __dirname,
    })
    
    await next.prepare()

    const handle = next.getRequestHandler()

    Server({handle, port})
}
