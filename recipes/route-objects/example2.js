'use strict'

let router = require('../../index')({
  prefix: '/api'
})

let foobar = router.createRoute('GET /foo/bar', (ctx, next) => {}, (ctx, next) => {})

console.log(foobar)
console.log(foobar.prefix) // => '/api'
console.log(foobar.path)   // => '/api/foo/bar'
console.log(foobar.route)  // => '/foo/bar'
console.log(foobar.middlewares.length) // => 2
