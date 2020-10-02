
const gql = require('../../utils/gql')

const {snakeToPascal, snakeToCamel, camelToSnake, merge} = require('./helpers')

module.exports = function Mutation(runOnMiddle, whereVariables, {databaseName, data, pubSub, controller}, extendSchema, extendResolvers) {

    return {
        resolvers: {
            Mutation: {
                hello: async (obj, {name}, ctx) => {
            
                    return 'salam: ' + name
                },
                addFile: async (obj, args, ctx) => {
                
                    return await runOnMiddle('add', 'file', [obj, args, ctx], async (obj, {file: fileUploaded}, ctx) => {
                        const {createReadStream, filename, mimetype, encoding} = await fileUploaded
                        const stream = createReadStream()
                
                        const allowedMimeTypes = ['image/jpeg', 'image/png']
                        if (!allowedMimeTypes.includes(mimetype)) {
                            await data.filer.itNow(stream, {folder: null})
                            return null;
                        }

                        const id = data.filer.newName('uploads', mimetype)
                        const path = await data.filer.itNow(stream, {
                            folder: 'uploads',
                            rename: id,
                        })
                
                        const size = data.filer.sizeOfFile(path)
                        const thisPath = data.filer.pathOf('uploads', id)
                        const {width, height} = await data.side.camera.getDimensionsOfImage(thisPath)
                        const file = await data.db.insertOne(
                            databaseName,
                            'file',
                            {
                                name: filename,
                                path_name: id,
                                kind: 'PHOTO',
                                mime_type: mimetype,
                                encoding,
                                volume: size,

                                width,
                                height,
                                duration: 0,
                            },
                        )
                        
                        await data.filer.move(path, databaseName, id)

                        return file
                    })
                    
                },
                ...merge(
                    data.info.TABLES[databaseName].map((table) => ({
                        [`write${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            let item = !args.id ? null : (await data.db.findOne(databaseName, table.name, {id: args.id}))

                            if (!item) {
                                return await runOnMiddle('add', table.name, [obj, args, ctx], async (obj, args, ctx) => {
                                    let columns = data.info.COLUMNS[databaseName][table.name]
                                    if (data.info.COLUMNS[databaseName][table.name].isIdAutoIncrement) {
                                        columns = columns.filter(col => col.name !== 'id')
                                    }
                                    const q = columns.reduce((prev, col) => (args[snakeToCamel(col.name)] === undefined) ? prev : ({
                                        ...prev,
                                        [col.name]: args[snakeToCamel(col.name)],
                                    }), {})

                                    const row = await data.db.insertOne(databaseName, table.name, q)
    
                                    return row
                                })
                            }
                            
                            return await runOnMiddle('edit', table.name, [obj, args, ctx], async (obj, args, ctx) => {
                                const columns = data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id')
                                    .filter(col => snakeToCamel(col.name) in args)

                                if (!columns.length) return null

                                const row = await data.db.updateOne(
                                    databaseName,
                                    table.name,
                                    args.id,
                                    columns.reduce(
                                        (prev, col) => (args[snakeToCamel(col.name)] === undefined) ? prev : ({
                                            ...prev,
                                            [col.name]: args[snakeToCamel(col.name)],
                                        }),
                                        {},
                                    )
                                )

                                return row
                            })
                        },
                        [`add${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            return await runOnMiddle('add', table.name, [obj, args, ctx], async (obj, args, ctx) => {

                                let columns = data.info.COLUMNS[databaseName][table.name]
                                if (data.info.COLUMNS[databaseName][table.name].isIdAutoIncrement) {
                                    columns = columns.filter(col => col.name !== 'id')
                                }

                                const q = columns.reduce((prev, col) => (args[snakeToCamel(col.name)] === undefined) ? prev : ({
                                    ...prev,
                                    [col.name]: args[snakeToCamel(col.name)],
                                }), {})

                                const row = await data.db.insertOne(databaseName, table.name, q)

                                return row
                            })
                        },
                        [`edit${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            return await runOnMiddle('edit', table.name, [obj, args, ctx], async (obj, args, ctx) => {
                                const columns = data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id')
                                    .filter(col => snakeToCamel(col.name) in args)

                                if (!columns.length) return null

                                const row = await data.db.updateOne(
                                    databaseName,
                                    table.name,
                                    args.id,
                                    columns.reduce(
                                        (prev, col) => (args[snakeToCamel(col.name)] === undefined) ? prev : ({
                                            ...prev,
                                            [col.name]: args[snakeToCamel(col.name)],
                                        }),
                                        {},
                                    )
                                )

                                return row
                            })
                        },
                        [`editAll${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            const columns = data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id')
                                .filter(col => snakeToCamel(col.name) in args.setFields)

                            const {where, variables} = whereVariables(
                                data.info.COLUMNS[databaseName][table.name].filter(col => col.name !== 'id'),
                                args.where,
                            )

                            if (!columns.length || !variables.length) return null

                            const result = await data.query(
                                `UPDATE ${databaseName}.${table.name} SET ${columns.map(col => `\`${col.name}\` = ?`).join(', ')} ${where}`,
                                [
                                    ...columns.map(col => args.setFields[snakeToCamel(col.name)]),
                                    ...variables,
                                ],
                            )

                            // const row = await data.db.findOne(databaseName, table.name, {id: args.id})
                            // pubSub.publish(`${databaseName}.${table.name}_EDITED`, row)

                            return true
                        },
                        [`remove${snakeToPascal(table.name)}`]: async (obj, args, ctx) => {
            
                            const result = await data.query(
                                `DELETE FROM ${databaseName}.${table.name} WHERE \`id\` = ? LIMIT 1`,
                                [args.id],
                            )

                            pubSub.publish(`${databaseName}.${table.name}_REMOVED`, {id: args.id})

                            return null
                        },
                    }))
                ),
                ...extendResolvers('Mutation'),
            }
        },
        schema: gql`
            """Main mutation type."""
            type Mutation {
                hello(name: String): String
                addFile(file: Upload!): File
                ${data.info.TABLES[databaseName].map((table) => {
                    const args = data.info.COLUMNS[databaseName][table.name]
                    const argsString = !args.length ? `` : `(
                        ${args.map((column) => `
                            ${snakeToCamel(column.name)}: ID
                        `).join('\n')}
                    )`
                    return `
                        write${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
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
                        add${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
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
                        edit${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
                    `
                }).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => {
                    const args = data.info.COLUMNS[databaseName][table.name]
                    const argsString = !args.length ? `` : `(
                        where: ${snakeToPascal(table.name)}FieldsInput
                        setFields: ${snakeToPascal(table.name)}FieldsInput
                    )`
                    return `
                        editAll${snakeToPascal(table.name)}${argsString}: Boolean
                    `
                }).join('\n')}
                ${data.info.TABLES[databaseName].map((table) => {
                    const argsString = `(
                        id: ID
                    )`
                    return `
                        remove${snakeToPascal(table.name)}${argsString}: ${snakeToPascal(table.name)}
                    `
                }).join('\n')}
                ${extendSchema('Mutation')}
            }
        `,
    }
}