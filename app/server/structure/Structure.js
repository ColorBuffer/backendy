
const gql = require('../../utils/gql')

const Query = require('./Query')
const Mutation = require('./Mutation')
const Subscription = require('./Subscription')

const {snakeToPascal, snakeToCamel, camelToSnake, merge} = require('./helpers')

// https://dev.mysql.com/doc/refman/5.7/en/numeric-type-syntax.html
const intTypes = require('./intTypes')
const parseType = require('./parseType')

module.exports = async function Structure(databaseName, data, controller) {

    const pubSub = data.pubSubs[databaseName]
    
    function whereVariables(cols, args) {
        let where = 'WHERE 1'
        let variables = []

        for (let col of cols) {
            const argValue = args[snakeToCamel(col.name)]
            if (argValue === undefined || argValue === null || !argValue.length) continue;
            const parsedType = parseType(col.type)
            if (intTypes[parsedType.type] || parsedType.type.toLowerCase() === 'enum' || col.name.endsWith('_id')) {
                where += ` AND \`${col.name}\` = ?`
                variables.push(argValue)
            }
            else {
                where += ` AND (\`${col.name}\` LIKE ? OR \`${col.name}\` = ?)`
                variables.push('%' + argValue + '%', argValue)
            }
        }
        return {where, variables}
    }
    
    let i = 0;
    setInterval(e => pubSub.publish('COUNTER_UPDATED', {counter: i++}), 3000)

    function List(ofType) {
        return {
            resolvers: {
                [`List_${ofType}`]: {
                    totalCount: (obj, args, ctx) => {
                        return obj.totalCount
                    },
                    items: (obj, args, ctx) => {
                        return obj.items
                    },
                    edges: function(obj, args, ctx) {
                        return obj.items
                    },
                    pageInfo: function(obj, args, ctx) {
                        return obj.items
                    },
                },
                ['Edge_' + ofType]: {
                    node: function(obj, args, ctx) {
                        return obj;
                    },
                    cursor: function(obj, args, ctx) {
                        return obj._TODO_REMOVE_CURSOR ? obj._TODO_REMOVE_CURSOR : obj.id;
                    },
                },
            },
            schema: gql`
                type List_${ofType} {
                    totalCount: Int
                    items: [${ofType}]
                    edges: [Edge_${ofType}]
                    pageInfo: PageInfo
                }
                type Edge_${ofType} {
                    # hasNextPage.
                    node: ${ofType}
        
                    # cursor.
                    cursor: ID
                }
            `,
        }
    }


    function extendSchema(typeName) {
        if (!controller || !controller.typeExtensions || !controller.typeExtensions[typeName] || !controller.typeExtensions[typeName].schema) return ''
        return controller.typeExtensions[typeName].schema
    }
    function extendResolvers(typeName) {
        if (!controller || !controller.typeExtensions || !controller.typeExtensions[typeName] || !controller.typeExtensions[typeName].resolvers) return {}
        return controller.typeExtensions[typeName].resolvers
    }
    function extendTypes() {
        if (!controller || !controller.typeExtensions) return []
        const aaa = data.info.TABLES[databaseName]
        return Object.keys(controller.typeExtensions)
            .filter(key => !['Query', 'Subscription', 'Mutation', ...aaa.map(table => snakeToPascal(table.name))].includes(key))
            .map(key => controller.typeExtensions[key])
    }

    async function runOnMiddle(action, tableName, [obj, args, ctx], next) {

        if (!controller) return await next(obj, args, ctx)

        return await controller.middleware(action, tableName, [obj, args, ctx], next)
    }

    const entities = [
        {
            schema: gql`
                # Base schema type.
                schema {
                    query: Query
                    mutation: Mutation
                    subscription: Subscription
                }
            `,
        },
        Query(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers),
        Mutation(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers),
        Subscription(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers),

        ...data.info.TABLES[databaseName].map(table => ({
            resolvers: {
                [snakeToPascal(table.name)]: {
                    ...merge(
                        data.info.COLUMNS[databaseName][table.name].map(column => {
                            const usage = data.info.STATUSES[databaseName][table.name].refrences[column.name]
                            if (usage && usage.REFERENCED_TABLE_NAME) {
                                return {
                                    [snakeToCamel(column.name.slice(0, -3))]: async (obj, {}, ctx) => {
                                        return await data.db.findOne(databaseName, usage.REFERENCED_TABLE_NAME, {id: obj[column.name]})
                                    }
                                }
                            }
                            return {
                                [snakeToCamel(column.name)]: async (obj, {}, ctx) => {
                                    return obj[column.name]
                                }
                            }
                        })
                    ),
                    ...extendResolvers(snakeToPascal(table.name)),
                },
            },
            schema: gql`
                type ${snakeToPascal(table.name)} {
                    ${data.info.COLUMNS[databaseName][table.name].map((column) => {
                        const usage = data.info.STATUSES[databaseName][table.name].refrences[column.name]
                        if (usage && usage.REFERENCED_TABLE_NAME) {
                            return `
                                ${snakeToCamel(column.name.slice(0, -3))}: ${snakeToPascal(usage.REFERENCED_TABLE_NAME)}
                            `
                        }
                        return `
                            ${snakeToCamel(column.name)}: String
                        `
                    }).join('\n')}
                    ${extendSchema(snakeToPascal(table.name))}
                }
            `,
        })),

        ...extendTypes(),

        ...data.info.TABLES[databaseName].map(table => ({
            schema: gql`
                input ${snakeToPascal(table.name)}FieldsInput {
                    ${data.info.COLUMNS[databaseName][table.name].map((column) => {
                        return `
                            ${snakeToCamel(column.name)}: ID
                        `
                    }).join('\n')}
                }
            `,
        })),

        ...data.info.TABLES[databaseName].map(table => List(snakeToPascal(table.name))),

        {
            resolvers: {
                File: {
                    size: function(obj, args, ctx) {
                        return obj.volume;
                    },
                    url: function(obj, args, ctx) {
                        return data.filer.urlOfFilePath(databaseName, obj.path_name)
                    },
                    mimeType: (obj, args, ctx) => {
                        return obj.mime_type;
                    },

                    shot: async function(obj, {minWidth}, ctx) {

                        // obtain new size
                        const availableWidths = [64, 128, 256, 512, 728, 1024, 2048]
                        const newWidth = availableWidths.find(width => width >= parseInt(minWidth) && width < obj.width)
                        if (!newWidth) return obj
                        const newHeight = (obj.width === obj.height) ? newWidth : Math.floor(newWidth / obj.width * obj.height)
                        
                        const newFolder = `${databaseName}-cache`
                        const newPathName = `${newWidth}.${newHeight}.${obj.path_name}`

                        if (!await data.filer.exists(newFolder, newPathName)) {
                            const filePath = data.filer.pathOf(databaseName, obj.path_name)
                            const stream = await data.side.camera.resizeImage(filePath, newWidth, newHeight)
                            await data.filer.itNow(stream, {
                                folder: newFolder,
                                rename: newPathName,
                            })
                        }
                        
                        return {
                            ...obj,
                            isShot: true,
                            path_name: newPathName,
                            width: newWidth,
                            height: newHeight,
                        }
                    },
                    placeholder: function(obj, args, ctx) {
        
                        // TODO placeholders from placeholder folder
                        // if (obj.placeholder_svg) {
                        //     return obj.placeholder_svg.replace(/"/g, "'");
                        // }
        
                        // if (!underProcessPlaceHolder[obj.id]) {
                        //     underProcessPlaceHolder[obj.id] = true;
                        //     (async () => {
                        //         const filePath = data.filer.pathOf('files', obj.path_name);
                        //         const result = await data.side.camera.createSVGPlaceHolder(filePath);
        
                        //         await obj.update({
                        //             placeholder_base64: result.svg_base64encoded,
                        //             placeholder_svg: result.final_svg ,
                        //         });
                        //         underProcessPlaceHolder[obj.id] = false;
                        //     })();
                        // }
        
                        return null;
                    },
                },
                FileShot: {
                    size: function(obj, args, ctx) {
                        return obj.volume;
                    },
                    url: function(obj, args, ctx) {
                        return data.filer.urlOfFilePath(obj.isShot ? `${databaseName}-cache` : databaseName, obj.path_name)
                    },
                    mimeType: (obj, args, ctx) => {
                        return obj.mime_type;
                    },
                },
            },
            schema: gql`
                """File"""
                type File {
                    id: String
                    size: String
                    width: String
                    height: String
                    name: String
                    mimeType: String
                    encoding: String
                    url: String
                    shot(minWidth: Int!): FileShot
                    placeholder: String
                }
                type FileShot {
                    id: String
                    size: String
                    width: String
                    height: String
                    name: String
                    mimeType: String
                    encoding: String
                    url: String
                }
            `,
        },
    ]

    return entities
}
