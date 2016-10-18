'use strict'

let router = require('../../index')({
  prefix: '/api'
})

router.addRoute('GET /users', (ctx, next) => {
  ctx.body = `Route is ${ctx.route.route} and prefix is ${ctx.route.prefix}`
  ctx.body = `${ctx.body}. So path is ${ctx.route.path}`
  return next()
})

// Server
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.use(router.middleware({ prefix: '/foo' }))

app.listen(3333, () => {
  console.log('Open http://localhost:3333/api/users')
  console.log('And try http://localhost:3333/foo/users')
})
