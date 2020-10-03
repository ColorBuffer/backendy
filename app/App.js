
const Data  = require('./data/Data')
const Server = require('./server/Server')
const Aside = require('./aside/Aside')
const Web = require('./web/Web')

const HTTP = require('http')
const url = require('url')
const path = require('path')
const cors = require('@koa/cors')
const Koa = require('koa')
const Router = require('@koa/router')
const Static = require('./server/helpers/KoaStatic')

module.exports = async function App(config) {

    const aside = Aside(config.aside)

    const data = await Data(config.data, aside)
    
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
    middlewares.forEach(middle => koa.use(middle))
    koa.use(router.routes())
    koa.use(router.allowedMethods())

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
