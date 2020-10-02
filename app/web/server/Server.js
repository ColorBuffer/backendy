
const Koa = require('koa')
const Router = require('@koa/router')
const Static = require('../../server/helpers/KoaStatic')
const path    = require('path')

module.exports = async function Server({next, port, ssl}) {

    const koa = new Koa()
    const router = new Router()

    const handle = next.getRequestHandler()
    
    router.get(
        '/public',
        Static(__dirname + '/../public', {
            maxage: 1000 * 60 * 60 * 24 * 90,
        }),
    )

    router.all('(.*)', async (ctx) => {
        console.log('Request', ctx.req.url)
        await handle(ctx.req, ctx.res)
        ctx.respond = false
    })

    koa.use(async (ctx, next) => {
        ctx.res.statusCode = 200
        await next()
    })

    koa.use(router.routes())
    koa.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`)
    })

}
