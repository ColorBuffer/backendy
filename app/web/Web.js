
const Next   = require('next')
const path   = require('path')

module.exports = async function Web({dev}) {

    const next = Next({
        dev,
        dir: __dirname,
    })
    
    await next.prepare()

    const handle = next.getRequestHandler()

    return handle
}
