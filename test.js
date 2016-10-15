/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var request = require('supertest')
let test = require('mukla')
let Koa = require('koa')
var isGen = require('is-es6-generator-function')
let Router = require('./index')
let router = Router()
let app = new Koa()

test('should expose constructor', function (done) {
  test.strictEqual(typeof Router, 'function')
  test.strictEqual(typeof Router(), 'object')
  test.strictEqual(typeof (new Router()), 'object')
  test.strictEqual(typeof router, 'object')
  done()
})

test('should have `.addRoute`, `.middleware` and `legacyMiddleware` methods', function (done) {
  test.strictEqual(typeof router.addRoute, 'function')
  test.strictEqual(typeof router.createRoute, 'function')
  test.strictEqual(typeof router.groupRoutes, 'function')
  test.strictEqual(typeof router.middleware, 'function')
  test.strictEqual(typeof router.loadMethods, 'function')
  test.strictEqual(typeof router.legacyMiddleware, 'function')
  done()
})

test('should not have the HTTP verbs as methods if not `.loadMethods` called', function (done) {
  test.strictEqual(router.get, undefined)
  test.strictEqual(router.put, undefined)
  test.strictEqual(router.del, undefined)
  test.strictEqual(router.post, undefined)
  test.strictEqual(router.patch, undefined)
  test.strictEqual(router.delete, undefined)
  done()
})

test('should have HTTP verbs as methods when `.loadMethods` is called', function (done) {
  let api = Router({ prefix: '/api' })
  api.loadMethods()
  test.strictEqual(typeof api.put, 'function')
  test.strictEqual(typeof api.get, 'function')
  test.strictEqual(typeof api.post, 'function')
  test.strictEqual(typeof api.patch, 'function')
  done()
})

test('should have `.route` method (path-match matcher) on instance', function (done) {
  test.strictEqual(typeof router.route, 'function')
  done()
})

test('should have empty `.routes` array on initialization', function (done) {
  test.strictEqual(Array.isArray(router.routes), true)
  test.strictEqual(router.routes.length, 0)
  done()
})

test('should `.addRoute/.createRoute` throw TypeError if `method` a string', function (done) {
  function fixture () {
    router.addRoute(123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `method` to be a string/)
  done()
})

test('should `.addRoute/.createRoute` throw TypeError route not a string, array or function', function (done) {
  function fixture () {
    router.addRoute('GET', 123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `route` be string, array or function/)
  done()
})

test('should `.addRoute` be able to accept single function as `route`', function (done) {
  let apiRouter = Router()
  apiRouter.addRoute('GET /users', function (ctx, next) {})
  done()
})

test('should `.addRoute` accept `route` to be array of middlewares', function (done) {
  let apiRouter = Router()
  apiRouter.addRoute('GET /companies', [
    function (ctx, next) {
      ctx.body = 'Hello world!'
      return next()
    },
    function * (next) {
      this.body = `${this.body} Try /companies and /api/companies`
      yield next
    }
  ])

  app.use(apiRouter.middleware({ prefix: '/api' }))
  request(app.callback()).get('/api/companies')
    .expect(200, /Hello world! Try/)
    .expect(/companies and/)
    .end(done)
})

test('should `.createRoute` just return route object', function (done) {
  let router = new Router({ prefix: '/api' })
  let route = router.createRoute('GET', '/users', [
    function foo (ctx, next) {},
    function bar (ctx, next) {},
    function baz (ctx, next) {}
  ])

  test.strictEqual(router.routes.length, 0)

  // route object
  test.strictEqual(route.prefix, '/api')
  test.strictEqual(route.path, '/api/users')
  test.strictEqual(route.pathname, '/users')
  test.strictEqual(route.route, '/users')
  test.strictEqual(route.method, 'GET')
  test.strictEqual(typeof route.match, 'function')
  test.strictEqual(route.middlewares.length, 3)
  done()
})

test('should `.middleware` return generator function when opts.legacy: true', function (done) {
  let router = Router()
  let ret = router.middleware({ legacy: true })
  test.strictEqual(isGen(ret), true)
  test.strictEqual(isGen(router.legacyMiddleware()), true)
  done()
})

test('should `.middleware` trigger route if request method not match', function (done) {
  let cnt = 111
  let api = new Router({
    prefix: '/api'
  })
  api.loadMethods().post('/comment', function * (next) {
    cnt++
    yield next
  })
  app.use(api.middleware())

  request(app.callback()).get('/comment').expect(404, function (err) {
    test.ifError(err)
    test.strictEqual(cnt, 111)
    done()
  })
})

test('should call next middleware correctly', function (done) {
  let called = 0
  let koa = new Koa()
  router.loadMethods().get('/foobaz/:id', function * (next) {
    this.body = `Foo ${this.params.id} Baz`
    yield next
  })
  koa.use(router.middleware())
  koa.use(function (ctx, next) {
    called++
    return next()
  })

  request(koa.callback()).get('/foobaz/123').expect(/Foo 123 Baz/)
    .expect(200, function (err) {
      test.ifError(err)
      test.strictEqual(called, 1)
      done()
    })
})

test('should respect routes defined order (useful on REST APIs)', function (done) {
  let api = Router({ prefix: '/api' }).loadMethods()
  let app = new Koa()
  let called = 0

  api.get('/profiles/new', function (ctx, next) {
    ctx.body = `Create new profile. Route path: ${ctx.route.path}`
    return next()
  })
  .addRoute('GET /profiles/:profile', function * (next) {
    this.body = `Profile: ${this.params.profile}`
    yield next
  })

  app.use(api.middleware())
  app.use(function (ctx, next) {
    called++
    return next()
  })

  request(app.callback()).get('/api/profiles/new').expect(200, /Create new profile/)
    .end(function (err) {
      test.ifError(err)
      test.strictEqual(called, 1)

      // request specific user profile
      request(app.callback()).get('/api/profiles/123').expect(200, /Profile: 123/)
        .end(function (err) {
          test.ifError(err)
          test.strictEqual(called, 2)
          done()
        })
    })
})

test('should group multiple routes into one using `.groupRoutes`', function (done) {
  let app = new Koa()
  let api = Router({ prefix: '/api/v3' })

  let foo = router.createRoute('GET /foo/qux/xyz', function (ctx, next) {})
  let bar = router.createRoute('GET /bar/dog', function (ctx, next) {})
  let cat = router.createRoute('GET /cat', function (ctx, next) {
    ctx.body = 'okey barrrr'
    return next()
  })

  let baz = router.groupRoutes(foo, bar, cat)
  test.strictEqual(baz.route, '/foo/qux/xyz/bar/dog/cat')
  test.strictEqual(baz.path, '/foo/qux/xyz/bar/dog/cat')

  api.routes = api.routes.concat(baz)
  app.use(api.middleware())

  request(app.callback())
    .get('/api/v3/foo/qux/xyz/bar/dog/cat').expect(200, 'okey barrrr')
      .end(done)
})

test('should `.groupRoutes` throw TypeError if `dest` not an object', function (done) {
  function fixture () {
    router.groupRoutes([123], 33)
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /expect both `dest` and `src1`/)
  done()
})
