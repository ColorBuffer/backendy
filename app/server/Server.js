
/**
 * @see https://github.com/cnpm/koa-middlewares
 * @see https://github.com/jaydenseric/apollo-upload-examples
 * @see https://github.com/jaydenseric/graphql-multipart-request-spec
 */

const Structure = require('./structure/Structure')

const structureToSchema = require('./helpers/structureToSchema')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const {execute, subscribe} = require('graphql')

const path = require('path')
const url = require('url')

const HTTP = require('http')
const Koa  = require('koa')
const cors = require('@koa/cors')
const Router = require('@koa/router')
const Static = require('./helpers/KoaStatic')

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

    const router = new Router()

    router.get(
        '/storage/:folderName/:fileName',
        Static(path.dirname(data.filer.getStorageDir()), {
            maxage: 1000 * 60 * 60 * 24 * 90,
        }),
    )

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

    const koa = new Koa()
    koa.use(cors())
    koa.use(router.routes())
    koa.use(router.allowedMethods())
    middlewares.forEach(middle => koa.use(middle))

    const httpServer = HTTP.createServer(koa.callback())
    await new Promise(resolve => httpServer.listen(config.port, e => e ? reject(error) : resolve()))
    console.log(`🚀 Api Server ready at http://localhost:${config.port}`)

    // https://github.com/apollographql/subscriptions-transport-ws/issues/199
    httpServer.on('upgrade', (request, socket, head) => {
        const pathname = url.parse(request.url).pathname
        const name = pathname.substr(1, pathname.length - 1 - '/graphql'.length)
        const wsServer = wsServers[name]
        if (!wsServer) return socket.destroy()
        
        wsServer.wsServer.handleUpgrade(request, socket, head, function done(ws) {
            wsServer.wsServer.emit('connection', ws, request)
        })
    })
    
}