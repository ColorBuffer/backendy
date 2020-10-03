
// const helpers = {

//     async gainUserByAuthToken (core, authToken) {

//         if (!authToken) return {};

//         let session = await getSessionByToken(authToken);

//         // Invalid or unavailable session.
//         if (!session) return {};

//         let user = await getUserById(session.user_id);

//         return {user, session};
//     },
// };

// context: async ({ctx, connection}) => {

//     if (connection) {
//         return connection.context;
//     }

//     // let authorization = ctx.request.headers['authorization'];

//     // return {
//     //     ...(await helpers.gainUserByAuthToken(core, authorization)),
//     // };
// },
// subscriptions: {
//     onConnect: async (connectionParams, ws, connectionContext) => {

//         // // let authorization = ws.upgradeReq.headers.authorization;
//         // const authorization = connectionParams['authorization'];

//         // // console.log('onConnect params:', connectionParams);

//         // return {
//         //     ...(await helpers.gainUserByAuthToken(core, authorization)),
//         // };
//     },
//     onDisconnect: async (ws) => {
//         // console.log('onDisconnect');
//     },
// },

const parseType = require('./server/structure/parseType')

const gql = require('./utils/gql')
const intTypes = require('./server/structure/intTypes')

module.exports = function Controller(data, databaseName) {

    const extraConfig = {
        context: async ({ctx, connection}) => {

        },
        subscriptions: {
            onConnect: async (connectionParams, ws, connectionContext) => {

            },
            onDisconnect: async (ws) => {

            },
        },
    }

    async function middleware(action, tableName, [obj, args, ctx], next) {
        return await next(obj, args, ctx)
    }

    const typeExtensions = {
        Query: {
            schema: `
                databases: [Database]
                tables(databaseName: String): [Table]
                columns(databaseName: String, tableName: String): [Column]
                rows(databaseName: String, tableName: String): [Row]
            `,
            resolvers: {
                databases: async (obj, {}, ctx) => {
                    return data.info.DATABASES
                },
                tables: async (obj, {databaseName}, ctx) => {
                    if (!databaseName) return []
                    return data.info.TABLES[databaseName]
                },
                columns: async (obj, {databaseName, tableName}, ctx) => {
                    if (!databaseName || !tableName) return []

                    return data.info.COLUMNS[databaseName][tableName]
                },
                rows: async (obj, {databaseName, tableName}, ctx) => {
                    if (!databaseName || !tableName) return []
                    const results = await data.query(
                        'SELECT * FROM ' + databaseName + '.' + tableName + ' ORDER BY `id` DESC LIMIT 50',
                    )
                    const rows = results.map(result => ({data: JSON.stringify(result)}))
                    return rows
                },
            },
        },
        QueryHistory: {
            schema: `
                type QueryHistory {
                    count: Int
                    query: String
                    values: String
                    duration: Int
                }
            `,
            resolvers: {
            },
        },
        Subscription: {
            schema: `
                queryHistory(groupBy: String = "id"): [QueryHistory]
            `,
            resolvers: {
                queryHistory: {
                    resolve: function(obj, {groupBy}, ctx) {
                        const reduced = obj.reduce((prev, current) => {
                            if (!prev[current[groupBy]]) prev[current[groupBy]] = []
                            prev[current[groupBy]].push(current)
                            return prev
                        }, {})
                        for (const groupName in reduced) {
                            reduced[groupName] = {
                                count: reduced[groupName].length,
                                query: reduced[groupName][0].query,
                                values: reduced[groupName][0].values,
                                duration: Math.floor(reduced[groupName].reduce((prev, current) => prev + current.duration, 0) / reduced[groupName].length),
                            }
                        }
                        return Object.values(reduced)
                            .sort((a, b) => -(a.count - b.count))
                            .map(obj => ({
                                count: obj.count,
                                query: obj.query,
                                values: JSON.stringify(obj.values),
                                duration: obj.duration,
                            }))
                    },
                    subscribe: () => data.pubSubs[databaseName].asyncIterator('QUERY_HISTORY'),
                },
            }
        },
        // Passport: {
        //     resolvers: {
        //     },
        //     schema: gql`
        //     `,
        // },
        Database: {
            resolvers: {
                Database: {
                    id: (obj, args, ctx) => {
                        return obj;
                    },
                    name: (obj, args, ctx) => {
                        return obj;
                    },
                }
            },
            schema: gql`
                """Database"""
                type Database {
                    id: ID
                    name: String
                }
            `,
        },
        Table: {
            resolvers: {
                Table: {
                    id: (obj, args, ctx) => {
                        return obj.id;
                    },
                    name: (obj, args, ctx) => {
                        return obj.name;
                    },
                }
            },
            schema: gql`
                """Table"""
                type Table {
                    id: ID
                    name: String
                }
            `,
        },
        Row: {
            resolvers: {
                Row: {
                    data: (obj, args, ctx) => {
                        return obj.data;
                    },
                }
            },
            schema: gql`
                """Row"""
                type Row {
                    data: String
                }
            `,
        },
        Column: {
            resolvers: {
                Column: {
                    id: (obj, args, ctx) => {
                        return obj.id;
                    },
                    name: (obj, args, ctx) => {
                        return obj.name;
                    },
                    type: (obj, args, ctx) => {
                        return obj.type.split(' ')[0];
                    },
                    null: (obj, args, ctx) => {
                        return obj.null === 'YES';
                    },
                    maxCharacters: (obj, args, ctx) => {
                        const parsedType = parseType(obj.type)
        
                        if (parsedType.type === 'varchar') {
                            return parsedType.size
                        }
                        
                        if (!intTypes[parsedType.type]) return null;
        
                        return Math.max(
                            intTypes[parsedType.type][parsedType.unsigned][0].length,
                            intTypes[parsedType.type][parsedType.unsigned][1].length
                        )
                    },
                }
            },
            schema: gql`
                """Column"""
                type Column {
                    id: ID
                    name: String
                    type: String
                    null: Boolean
                    maxCharacters: Int
                }
            `,
        },
    }

    return {
        extraConfig,
        middleware,
        typeExtensions,
    }
}