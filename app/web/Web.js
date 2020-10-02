
const Next   = require('next')
const path   = require('path')
const Server = require('./server/Server')

module.exports = async function Web({dev, port}) {

    const next = Next({
        dev,
        dir: __dirname,
    })
    
    await next.prepare()

    Server({next, port, ssl: false})
}
