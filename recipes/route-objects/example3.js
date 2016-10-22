'use strict'

let extend = require('extend-shallow')
let router = require('../../index')()

let foo = router.createRoute('GET /foo', (ctx, next) => {})
console.log(foo)

let foo22 = extend({}, foo)
console.log(foo22) // same as above

// let's change `foo22` a bit
foo22.route = '/foobar'
let foobar = router.createRoute(foo22.method, foo22.route, foo22.middlewares)
console.log(foobar)

let bar = router.createRoute('GET /bar', (ctx, next) => {})

// output current routes (it is empty now)
console.log(router.routes)

// let's actually add them to the router
router.addRoutes(foo, bar, foobar)

// recheck the `routes` array
console.log(router.routes) // it is not empty now :)
