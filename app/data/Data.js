
const ConnectKnex = require('./ConnectKnex')
const KnexUtils = require('./KnexUtils')
const GS = require('graphql-subscriptions')
const DateTime = require('../utils/DateTime')

const KnexConfig = require('./KnexConfig')

const mysql = require('mysql2')
const Gateway = require('../side/gateway/Gateway')

const KavenegarApi = require('../side/telephony/KavenegarApi')
const Filer = require('./Filer')
const {merge} = require('../server/structure/helpers')
const queryString = require('querystring')

function QueryHistory(pubSub, keepMS) {

    let history = []

    function add(record) {
        record.id = Date.now() + '.' + Math.random()
        record.date = Date.now()

        history.push(record)

        // remove old records
        history = history.filter(record => record.date > Date.now() - keepMS)
    }

    setInterval(() => {
        if (!pubSub) return;
        pubSub.publish('QUERY_HISTORY', history)
    }, 1000 * 1)

    return {add}
}

module.exports = async function Data(config, side) {

    const pubSubs = {}

    const knexConfig = await KnexConfig(config.db)
    const knex = await ConnectKnex(knexConfig)
    const utils = KnexUtils(knex)
    
    const connection = mysql.createPool(config.db)

    let qh
    function query(query, values) {

        // benchmark
        const start = Date.now()

        return new Promise((resolve, reject) => connection.query(
            query,
            values,
            function(err, results, fields) {

                // log to history
                const duration = Date.now() - start
                qh && qh.add({query, values, duration})

                if (err) {
                    console.log(err, query, values)
                    return reject(err)
                }
                resolve(results)
            }
        ))
    }

    const filer = Filer(config.filer)



    async function getColums(databaseName, tableName) {
        const results = await query(
            `SHOW COLUMNS FROM ${databaseName}.${tableName}`
        )
        const tables = results
            .map(result => ({
                id: result.Field,
                name: result.Field,
                type: result.Type,
                null: result.Null,
                key: result.Key,
                default: result.Default,
                extra: result.Extra,
            }))
        return tables
    }

    await query(
        `SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`
    )
    const results0 = await query(`SHOW DATABASES`)
    const ignoreDBs = ['information_schema', 'mysql', 'performance_schema', 'sys']
    const DATABASES = results0.map(result => Object.values(result)[0])
        .filter(databaseName => !ignoreDBs.includes(databaseName))


    for (const databaseName of DATABASES) {
        pubSubs[databaseName] = new GS.PubSub()
    }
    
    qh = QueryHistory(pubSubs['backendy'], 1000 * 60)

    const TABLES = merge(
        await Promise.all(
            DATABASES.map(async databaseName => {

                const results1 = await query(
                    `SHOW TABLES FROM ${databaseName}`,
                )
            
                const tables = results1.map(result => Object.values(result)[0])
                    .filter(name => name !== 'file')
                    .map(name => ({id: name, name}))

                return {
                    [databaseName]: tables
                }
            })
        )
    )

    const COLUMNS = merge(
        await Promise.all(
            DATABASES.map(async databaseName => ({
                [databaseName]: merge(
                    await Promise.all(
                        TABLES[databaseName].map(async table => ({
                            [table.name]: await getColums(databaseName, table.name)
                        }))
                    )
                )
            }))
        )
    )

    const STATUSES = merge(
        await Promise.all(
            DATABASES.map(async databaseName => ({
                [databaseName]: merge(
                    await Promise.all(
                        TABLES[databaseName].map(async table => {
                            const results1 = await query(
                                `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE table_schema='${databaseName}' AND table_name='${table.name}'`,
                            )
                            let comment = {}
                            try {
                                comment = JSON.parse(results1[0].TABLE_COMMENT)
                            }
                            catch(e) {}

                            const results2 = await query(
                                `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_schema='${databaseName}' AND table_name='${table.name}'`,
                            )

                            const result3 = await query(
                                `SELECT *
                                FROM INFORMATION_SCHEMA.COLUMNS
                                WHERE TABLE_SCHEMA = '${databaseName}'
                                    and TABLE_NAME = '${table.name}'
                                    AND COLUMN_NAME = 'id'
                                    AND EXTRA like '%auto_increment%'`
                            )

                            return {
                                [table.name]: {
                                    comment,
                                    refrences: merge(
                                        results2.map(ref => ({
                                            [ref.COLUMN_NAME]: ref,                                            
                                        }))
                                    ),
                                    isIdAutoIncrement: !!result3.length
                                },
                            }
                        })
                    )
                )
            }))
        )
    )

    const info = {DATABASES, TABLES, COLUMNS, STATUSES}

    async function insertOne(databaseName, tableName, q) {

        async function lowLevelInsert(databaseName, tableName, q) {
            const colsString = Object.keys(q).map(name => `\`${name}\``).join(', ')
            const valsString = Object.keys(q).map(name => `?`).join(', ')
            const variables  = Object.values(q)
    
            const result = await query(
                `INSERT INTO ${databaseName}.${tableName} (${colsString}) VALUE (${valsString})`,
                variables,
            )
    
            return await db.findOne(databaseName, tableName, {id: result.insertId})
        }

        if (tableName === 'side_kavenegar') {
            const comment = info.STATUSES[databaseName][tableName].comment
            const kavenegar = KavenegarApi(comment.apiKey)
            try {
                const e = await kavenegar(q.action, JSON.parse(q.args))
                q.respond = JSON.stringify(e)
            }
            catch (e) {
                q.respond = e.message
            }
        }

        if (tableName === 'side_transaction') {

            if (!q.amount) return;
            let row = await lowLevelInsert(databaseName, tableName, q)

            // add sideTransaction.id to query parameters of url
            const newURL = new URL(q.back_url)
            newURL.search = queryString.stringify({
                sideTransactionId: row.id,
                ...queryString.parse(newURL.search),
            })

            const comment = info.STATUSES[databaseName][tableName].comment
            const gateway = Gateway(comment)
            const create = await gateway.createPaymentURL(
                q.way_name,
                q.amount,
                newURL.href,
                JSON.parse(q.detail),
            )
            if (!create) return false

            row = await updateOne(databaseName, tableName, row.id, {
                secret: JSON.stringify(create.secret),
                pay_url: create.url,
            })
            pubSubs[databaseName].publish(`${databaseName}.${tableName}_ADDED`, row)
            return row
        }

        const row = await lowLevelInsert(databaseName, tableName, q)
        pubSubs[databaseName].publish(`${databaseName}.${tableName}_ADDED`, row)
        return row
    }

    async function updateOne(databaseName, tableName, id, q) {

        let row = await db.findOne(databaseName, tableName, {id})

        if (tableName === 'side_transaction' && q.back_data) {
            const {backQuery, backBody} = JSON.parse(q.back_data)

            if (!row.amount) return;
            
            const comment = info.STATUSES[databaseName][tableName].comment
            const gateway = Gateway(comment)

            let newSecret = await gateway.validatePayment(
                row.way_name,
                JSON.parse(row.secret),
                backQuery,
                backBody,
            )
            if (newSecret) {
                q.paid_at = DateTime()
                q.secret = JSON.stringify(newSecret)
                q.status = 'VERIFIED'
            }
        }
        
        if (Object.keys(q).length) {
            const result = await query(
                `UPDATE ${databaseName}.${tableName} SET ${Object.keys(q).map(col => `\`${col}\` = ?`).join(', ')} WHERE \`id\` = ? LIMIT 1`,
                [
                    ...Object.values(q),
                    id,
                ],
            )
        }

        row = {
            ...row,
            ...q,
        }

        pubSubs[databaseName].publish(`${databaseName}.${tableName}_EDITED`, row)

        return row
    }

    const db = {
        findOne: async function(databaseName, tableName, q) {
            const rows = await query(
                `SELECT * FROM ${databaseName}.${tableName} WHERE ${Object.keys(q)[0]} = ? LIMIT 1`,
                [Object.values(q)[0]],
            )
            return rows[0]
        },
        insertOne,
        updateOne,
    }

    return {
        query,
        db,
        utils,
        complexQuery: knex,
        filer,
        info,
        pubSubs,
        side,
    }
}