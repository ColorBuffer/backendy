
const fetch = require('node-fetch')

module.exports = function ApiNodeFetcher(config) {
    return function (body) {
        return fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': config.authorization || '',
            },
            body: JSON.stringify(body),
        })
            .then(result => result.json())
    }
}
