

const {gql, GraphQLUpload, makeExecutableSchema} = require('apollo-server')

function entities2resolvers(entities) {
    
    let resolvers = {};
    for (let entity of entities) {
        
        resolvers = {
            ...resolvers,
            ...(entity.resolvers || {}),
        }
    }

    resolvers.Upload = GraphQLUpload;

    return resolvers;
}

function entities2defs(entities) {

    let typeDefs = entities.map(entity => entity.schema || '').join('\n');

    return typeDefs;
}

module.exports = function structureToSchema({structure}) {

    const resolvers = entities2resolvers(structure)

    let typeDefs = entities2defs(structure)
    typeDefs +=  `
    scalar Upload
    `
    typeDefs = gql(typeDefs)

    resolvers.Upload = GraphQLUpload

    return makeExecutableSchema({typeDefs, resolvers})
}