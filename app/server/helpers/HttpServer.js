
const http = require('http')
const https = require('https')
const fs = require('fs')

module.exports = function HttpServer(requestListener, ssl = false) {

    if (!ssl) return http.createServer(requestListener)
    const credentials = {
        key: fs.readFileSync(ssl.key),
        cert: fs.readFileSync(ssl.cert),
    }
    return https.createServer(credentials, requestListener)
}