
const Knex = require('knex')
const colors = require('colors/safe')

module.exports = async function ConnectKnex(knexConfig) {
    const knex = await Knex(knexConfig)

    // test connection
    try {
        await knex.raw('select 1')
        console.log(colors.green('DB: Connection has been established successfully.'))
    }
    catch (e) {
        console.error(colors.red('DB: Unable to connect to the database:'))
        throw e
    }

    return knex
}
