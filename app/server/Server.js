
/**
 * @see https://github.com/cnpm/koa-middlewares
 * @see https://github.com/jaydenseric/apollo-upload-examples
 * @see https://github.com/jaydenseric/graphql-multipart-request-spec
 */

const Structure = require('./structure/Structure')

const structureToSchema = require('./helpers/structureToSchema')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const {execute, subscribe} = require('graphql')
const url = require('url')

const ASK  = require('apollo-server-koa')

module.exports = async function Server(data, config, controllers) {

    function getController(dbName) {
        if (!controllers[dbName]) return null
        return controllers[dbName](data, dbName)
    }
    
    function origin(name) {
        return (ctx) => {
            return config.whitelist.includes(url.parse(ctx.request.header.referer).host) ? '*' : ''
        }
    }

    const wsServers = {}
    const middlewares = []
    for (const name of data.info.DATABASES) {

        const controller = getController(name)
        const structure = await Structure(name, data, controller)

        const schema = structureToSchema({structure})

        const apolloServer = new ASK.ApolloServer({
            ...(controller ? controller.extraConfig : {}),
            schema,
            introspection: true,
            playground: {
                endpoint: `/${name}/graphql`,
                subscriptionEndpoint: `/${name}/graphql`,
            },
            subscriptions: `/${name}/graphql`,
        })

        middlewares.push(
            apolloServer.getMiddleware({
                path: `/${name}/graphql`,
                cors: {
                    origin: origin(name),
                }
            })
        )

        wsServers[name] = SubscriptionServer.create({execute, subscribe, schema}, {noServer: true})
    }

    return {wsServers, middlewares}
    
}