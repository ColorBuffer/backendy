
const path = require('path')

module.exports = function KnexConfig(config) {

    return {
        client: 'mysql',
        connection: {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            charset: 'utf8mb4',
            timezone: 'Asia/Tehran',
        },
        pool: {
            min: 2,
            max: 10,
        },
    }
}
