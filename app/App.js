
const Data  = require('./data/Data')
const Server = require('./server/Server')
const Side = require('./side/Side')
const Web = require('./web/Web')

const HTTP = require('http')
const cors = require('@koa/cors')

const Koa = require('koa')
const Router = require('@koa/router')
const Static = require('./server/helpers/KoaStatic')
const path    = require('path')

module.exports = async function App(config) {

    const side = Side(config.side)

    const data = await Data(config.data, side)
    
    const {wsServers, middlewares} = await Server(data, config.server, config.controllers)
    const web = await Web(config.web)

    const router = new Router()
    router.get(
        '/storage/:folderName/:fileName',
        Static(path.dirname(data.filer.getStorageDir()), {
            maxage: 1000 * 60 * 60 * 24 * 90,
        }),
    )

    router.get(
        '/public',
        Static(__dirname + '/../public', {
            maxage: 1000 * 60 * 60 * 24 * 90,
        }),
    )

    router.all('(.*)', async (ctx) => {
        console.log('Request', ctx.req.url)
        await web(ctx.req, ctx.res)
        ctx.respond = false
    })

    // koa.use(async (ctx, next) => {
    //     ctx.res.statusCode = 200
    //     await next()
    // })

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
