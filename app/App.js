
const Data  = require('./data/Data')
const Server = require('./server/Server')
const Side = require('./side/Side')
const Web = require('./web/Web')

const Koa = require('koa')
const Router = require('@koa/router')
const Static = require('./server/helpers/KoaStatic')
const path    = require('path')

module.exports = async function App(config) {

    const side = Side(config.side)

    const data = await Data(config.data, side)
    
    const server = await Server(data, config.server, config.controllers)

    const web = Web(config.web)

    const koa = new Koa()
    const router = new Router()

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

    koa.use(async (ctx, next) => {
        ctx.res.statusCode = 200
        await next()
    })

    koa.use(router.routes())
    koa.listen(config.port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${config.port}`)
    })


}
