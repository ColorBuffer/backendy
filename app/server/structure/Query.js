
const gql = require('../../utils/gql')

const {snakeToPascal, snakeToCamel, camelToSnake, merge} = require('./helpers')

module.exports = function Query(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers) {
    return {
        resolvers: {
            Query: {
                hello: async (obj, {name}, ctx) => {
            
                    return 'salam: ' + name
                },
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`get${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            return await data.db.findOne(databaseName, table.name, {id: args.id})
                        },
                    }))
                ),
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`all${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            const {where, variables} = whereVariables(data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id'), args)

                            const rows = await data.query(
                                `SELECT * FROM ${databaseName}.${table.name} ${where} ORDER BY \`${'id'}\` ASC`,
                                [...variables],
                            )
                            return rows
                        },
                    }))
                ),
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`paginate${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            return await runOnMiddle('paginate', table.name, [obj, args, ctx], async (obj, args, ctx) => {
                                const {where, variables} = whereVariables(data.info.COLUMNS[databaseName][table.name], args)

                                const query_string = `SELECT COUNT(*) AS c FROM ${databaseName}.${table.name} ${where}`
                                const rows = await data.query(
                                    query_string,
                                    [...variables],
                                )

                                let asc = null
                                let desc = 'id'
                                if (args.orderByAsc && data.info.COLUMNS[databaseName][table.name].find(col => col.name === camelToSnake(args.orderByAsc)))
                                    asc = camelToSnake(args.orderByAsc)
                                if (args.orderByDesc && data.info.COLUMNS[databaseName][table.name].find(col => col.name === camelToSnake(args.orderByDesc)))
                                    desc = camelToSnake(args.orderByDesc)
                                const items = await data.query(
                                    `SELECT * FROM ${databaseName}.${table.name} ${where} ORDER BY \`${asc ? asc : desc}\` ${asc ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`,
                                    [...variables, args.pagination.first, args.pagination.after],
                                )

                                return {
                                    items,
                                    totalCount: rows[0].c,
                                }
                            })
                        },
                    }))
                ),
                ...extendResolvers('Query'),
            },
            PageInfo: {
                startCursor: function(obj, args, ctx) {
                    let first = obj[0];
                    return first ? (first._TODO_REMOVE_CURSOR ? first._TODO_REMOVE_CURSOR : first.id) : null;
                },
                endCursor: function(obj, args, ctx) {
                    let reversed = obj.reverse();
                    let last = reversed[0];
                    return last ? (last._TODO_REMOVE_CURSOR ? last._TODO_REMOVE_CURSOR : last.id) : null;
                },
                hasNextPage: function(obj, args, ctx) {
                    return true;
                },
            },
        },
        schema: gql`
            """Main query type."""
            type Query {
                hello(name: String): String
                ${data.info.TABLES[databaseName].map((table) => `
                    get${snakeToPascal(table.name)}(
                        id: ID
                    ): ${snakeToPascal(table.name)}
                `).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => {
                    const arguments = data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id').map((column) => `
                        ${snakeToCamel(column.name)}: ID
                    `)
                    return `
                        all${snakeToPascal(table.name)}${arguments.length ? `(${arguments.join('\n')})` : ''}: [${snakeToPascal(table.name)}]
                    `
                }).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => `
                    paginate${snakeToPascal(table.name)}(
                        pagination: PaginationInput = {first: 10}
                        orderByDesc: String
                        orderByAsc: String
                        ${data.info.COLUMNS[databaseName][table.name]/*.filter(col => col.name !== 'id')*/.map((column) => `
                            ${snakeToCamel(column.name)}: ID
                        `).join('\n')}
                    ): List_${snakeToPascal(table.name)}
                `).join('\n')}
                ${extendSchema('Query')}
            }
            input PaginationInput {
                first: Int
                after: ID
            }
            # Page information.
            type PageInfo {
                # startCursor.
                startCursor: ID
    
                # endCursor.
                endCursor: ID
    
                # hasNextPage.
                hasNextPage: Boolean
            }
        `,
    }
}