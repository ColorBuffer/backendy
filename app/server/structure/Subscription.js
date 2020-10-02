
const gql = require('../../utils/gql')
const GS = require('graphql-subscriptions')
const withCancel = require('./withCancel')

const {snakeToPascal, snakeToCamel, camelToSnake, merge} = require('./helpers')

module.exports = function Subscription(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers) {

    return {
        resolvers: {
            Subscription: {
                counter: {
                    resolve: function(obj, {}, ctx) {
                        return obj.counter;
                    },
                    subscribe: () => pubSub.asyncIterator('COUNTER_UPDATED'),
                },
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`added${snakeToPascal(table.name)}`]: {
                            resolve: function(obj, args, ctx) {
                                return obj
                            },
                            subscribe: GS.withFilter(
                                (DATA, args, ctx) => {
                                    const iterator = pubSub.asyncIterator(`${databaseName}.${table.name}_ADDED`);
                                    return withCancel(
                                        iterator,
                                        () => {
                                            
                                        },
                                    )
                                },
                                (DATA, args, ctx) => {
                                    return !data.info.COLUMNS[databaseName][table.name].map(column => {
                                        if (!args[snakeToCamel(column.name)]) return true
                                        return args[snakeToCamel(column.name)] == DATA[column.name]
                                    }).includes(false)
                                }, 
                            ),
                        },
                    }))
                ),
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`edited${snakeToPascal(table.name)}`]: {
                            resolve: function(obj, args, ctx) {
                                return obj
                            },
                            subscribe: GS.withFilter(
                                (DATA, args, ctx) => {
                                    const iterator = pubSub.asyncIterator(`${databaseName}.${table.name}_EDITED`);
                                    return withCancel(
                                        iterator,
                                        () => {
                                            
                                        },
                                    )
                                },
                                (DATA, args, ctx) => {
                                    return !data.info.COLUMNS[databaseName][table.name].map(column => {
                                        if (!args[snakeToCamel(column.name)]) return true
                                        return args[snakeToCamel(column.name)] == DATA[column.name]
                                    }).includes(false)
                                }, 
                            ),
                        },
                    }))
                ),
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`removed${snakeToPascal(table.name)}`]: {
                            resolve: function(obj, args, ctx) {
                                return obj
                            },
                            subscribe: GS.withFilter(
                                (DATA, args, ctx) => {
                                    const iterator = pubSub.asyncIterator(`${databaseName}.${table.name}_REMOVED`);
                                    return withCancel(
                                        iterator,
                                        () => {
                                            
                                        },
                                    )
                                },
                                (DATA, args, ctx) => {
                                    return !data.info.COLUMNS[databaseName][table.name].map(column => {
                                        if (!args[snakeToCamel(column.name)]) return true
                                        return args[snakeToCamel(column.name)] == DATA[column.name]
                                    }).includes(false)
                                }, 
                            ),
                        },
                    }))
                ),
                ...extendResolvers('Subscription'),
            }
        },
        schema: gql`
            """Main subscription type."""
            type Subscription {
                counter: Int
                ${data.info.TABLES[databaseName].map((table) => {
                    const args = data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id')
                    const argsString = !args.length ? `` : `(
                        ${args.map((column) => `
                            ${snakeToCamel(column.name)}: ID
                        `).join('\n')}
                    )`
                    return `
                        added${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
                    `
                }).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => {
                    const args = data.info.COLUMNS[databaseName][table.name]
                    const argsString = !args.length ? `` : `(
                        ${args.map((column) => `
                            ${snakeToCamel(column.name)}: ID
                        `).join('\n')}
                    )`
                    return `
                        edited${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
                    `
                }).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => {
                    const args = data.info.COLUMNS[databaseName][table.name]
                    const argsString = !args.length ? `` : `(
                        ${args.map((column) => `
                            ${snakeToCamel(column.name)}: ID
                        `).join('\n')}
                    )`
                    return `
                        removed${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
                    `
                }).join('\n')}
                ${extendSchema('Subscription')}
            }
        `,
    }
}