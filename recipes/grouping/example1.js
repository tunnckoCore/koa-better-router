'use strict'

let router = require('../../index')()

let foo = router.createRoute('GET /foo/bar', (ctx, next) => {
  ctx.body = 'This is /foo/bar route!'
  return next()
})
console.log(foo.route) // => '/foo/bar'
console.log(foo.middlewares.length) // => 1

let baz = router.createRoute('GET /baz/qux', (ctx, next) => {
  ctx.body = `Woo hoo, this is ${ctx.route.path}!`
  return next()
})
console.log(baz.route) // => '/baz/qux'
console.log(baz.middlewares.length) // => 1

// group them
let combined = router.groupRoutes(foo, baz)
console.log(combined.route) // => '/foo/bar/baz/qux'
console.log(combined.middlewares.length) // => 1

router.addRoutes(combined)

// there's only one route in routes array
console.log('routes number:', router.getRoutes().length) // => 1

// Server
let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(router.middleware())

app.listen(2222, () => {
  console.log('Open http://localhost:2222/foo/bar/baz/qux')
})
