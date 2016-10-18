'use strict'

let router = require('../../index')()

let foo = router.createRoute('GET /foo/bar', (ctx, next) => {
  ctx.body = 'Hello FooBar!'
  return next()
})
let baz = router.createRoute('GET /baz/qux', (ctx, next) => {
  // notice that you should also prepend/append
  // the body from `/foo/bar` route
  ctx.body = `${ctx.body} Woo hoo, this is ${ctx.route.path}!`
  return next()
})

// group them by concating
// middlewares of both routes
baz.middlewares = foo.middlewares.concat(baz.middlewares)

let combined = router.groupRoutes(foo, baz)
console.log(combined.route) // => '/foo/bar/baz/qux'

// notice that there are two middlewares, not just one
console.log(combined.middlewares.length) // => 2

// "register" the new route
router.addRoutes(combined)

// Server
let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(router.middleware())

app.listen(3232, () => {
  console.log('Open http://localhost:3232/foo/bar/baz/qux')
})
