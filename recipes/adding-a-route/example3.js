'use strict'

let Router = require('../../index')
let router = new Router({ prefix: '/api' })

router.addRoute('GET /users', (ctx, next) => {
  ctx.body = `Route is ${ctx.route.path}`
  return next()
})

// Server
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.listen(4444, () => {
  console.log('Open http://localhost:4444/api/users')
})
