'use strict'

let router = require('../../index')()

let foobar = router.createRoute('GET', '/foo/bar', function * (next) {
  this.body = 'Hello Foo Bar!'
  yield next
})

console.log(foobar)
console.log(foobar.prefix) // => '/'
console.log(foobar.path)   // => '/foo/bar'
console.log(foobar.route)  // => '/foo/bar'
console.log(foobar.middlewares.length) // => 1
