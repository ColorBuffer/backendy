
const https       = require('https')
const queryString = require('querystring')

module.exports = function KavenegarApi(key) {

    const config = {
        host:     'api.kavenegar.com',
        version:  'v1',
        key:       key,
        protocol: 'https',
        port:     '443',
    }

    return function (method, params) {
        const path = `${config.protocol}://${config.host}/${config.version}/${config.key}/${method}.json`
        const content = queryString.stringify(params)
        const options = {
            host: config.host,
            port: config.port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Length': content.length,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
        }
        return new Promise((resolve, reject) => {
            const req = https.request(options, e => {
                e.setEncoding('utf8')
                let result = ''
                e.on('data', (data) => result += data)
                e.on('end', () => {
                    try {
                        const jsonObject = JSON.parse(result)
                        resolve({
                            response: jsonObject.entries,
                            status: jsonObject.return.status,
                            message: jsonObject.return.message,
                        })
                    }
                    catch (e) {
                        reject(e)
                    }
                })
            })
            req.write(content, 'utf8')
            req.on('error', e => reject(e))
            req.end()
        })
    }
}
