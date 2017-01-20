/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

let request = require('supertest')
let test = require('mukla')
let koa1 = require('koa')
let Koa = require('koa2')
let isGen = require('is-es6-generator-function')
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
  test.strictEqual(typeof router.addRoutes, 'function')
  test.strictEqual(typeof router.getRoute, 'function')
  test.strictEqual(typeof router.getRoutes, 'function')
  test.strictEqual(typeof router.createRoute, 'function')
  test.strictEqual(typeof router.groupRoutes, 'function')
  test.strictEqual(typeof router.extend, 'function')
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
  let apiRouter = Router({ prefix: '/api' })
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

  app.use(apiRouter.middleware())
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

  test.strictEqual(router.getRoutes().length, 0)

  // route object
  test.strictEqual(route.prefix, '/api')
  test.strictEqual(route.path, '/api/users')
  test.strictEqual(route.route, '/users')
  test.strictEqual(route.method, 'GET')
  test.strictEqual(typeof route.match, 'function')
  test.strictEqual(route.middlewares.length, 3)
  done()
})

test('should `.legacyMiddleware` return generator function', function (done) {
  let router = Router()
  let ret = router.middleware()
  test.strictEqual(isGen(ret), false)
  test.strictEqual(typeof ret, 'function')
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
  let ruter = Router()

  let foo = ruter.createRoute('GET /foo/qux/xyz', function (ctx, next) {})
  let bar = ruter.createRoute('GET /bar/dog', function (ctx, next) {})
  let cat = ruter.createRoute('GET /cat', function (ctx, next) {
    ctx.body = 'okey barrrr'
    return next()
  })

  let baz = ruter.groupRoutes(foo, bar, cat)
  test.strictEqual(baz.route, '/foo/qux/xyz/bar/dog/cat')
  test.strictEqual(baz.path, '/foo/qux/xyz/bar/dog/cat')

  ruter.addRoutes(baz)
  api.extend(ruter)
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

test('should be able to `.getRoute` using its pathname', function (done) {
  let v3 = Router().loadMethods()
  v3.get('/cat/foo', function (ctx, next) {})
  v3.get('/baz', function (ctx, next) {})

  test.strictEqual(v3.routes.length, 2)

  let baz = v3.getRoute('baz')
  let cat = v3.getRoute('cat/foo')
  let cat2 = v3.getRoute('/cat/foo')

  test.strictEqual(baz.route, '/baz')
  test.strictEqual(cat.route, '/cat/foo')
  test.strictEqual(cat2.route, '/cat/foo')
  test.strictEqual(cat.route, cat2.route)
  done()
})

test('should `.getRoute` throw TypeError if `name` not a string', function (done) {
  function fixie () {
    Router().getRoute(444)
  }
  test.throws(fixie, /expect `name` to be a string/)
  test.throws(fixie, TypeError)
  done()
})

test('should add multiple routes into `this.routes`, using `.addRoutes` method', function (done) {
  let roo = new Router()
  let foo = roo.createRoute('GET', '/foo', function (ctx, next) {
    ctx.body = 'foobar'
    return next()
  })
  let baz = roo.createRoute('GET', '/baz/qux', (ctx, next) => {})

  test.strictEqual(roo.routes.length, 0)
  roo.addRoutes(foo, baz)
  test.strictEqual(roo.routes.length, 2)
  done()
})

test('should `.getRoutes` return `this.routes` array', function (done) {
  test.strictEqual(router.getRoutes().length, router.routes.length)
  done()
})

test('should be able to `.extend` routers', function (done) {
  let apiRouter = Router({ prefix: '/api' })
  let usersRouter = Router()
  let catsRouter = Router()

  catsRouter.addRoute('GET /cats', (ctx, next) => {})

  usersRouter.addRoute('GET /users', (ctx, next) => {})
  usersRouter.addRoute('GET /api/users/new', (ctx, next) => {})

  // this route is first, with index 0
  apiRouter.addRoute('GET /foo/bar', (ctx, next) => {})

  // adds cats to users
  usersRouter.extend(catsRouter)

  // appends other router routes
  // to already exsting ones
  apiRouter.extend(usersRouter)

  test.strictEqual(apiRouter.routes.length, 4)

  test.strictEqual(apiRouter.routes[0].prefix, '/api')
  test.strictEqual(apiRouter.routes[0].route, '/foo/bar')
  test.strictEqual(apiRouter.routes[0].path, '/api/foo/bar')

  test.strictEqual(apiRouter.routes[1].prefix, '/api')
  test.strictEqual(apiRouter.routes[1].route, '/users')
  test.strictEqual(apiRouter.routes[1].path, '/api/users')

  test.strictEqual(apiRouter.routes[2].prefix, '/api')
  test.strictEqual(apiRouter.routes[2].route, '/api/users/new') // !!
  test.strictEqual(apiRouter.routes[2].path, '/api/api/users/new') // !!

  test.strictEqual(apiRouter.routes[3].prefix, '/api')
  test.strictEqual(apiRouter.routes[3].route, '/cats')
  test.strictEqual(apiRouter.routes[3].path, '/api/cats')
  done()
})

test('should `.extend` throw TypeError if `router` is not correct instance', function (done) {
  function fixture () {
    router.extend({foo: 'bar', routes: []})
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `router` to be instance of KoaBetterRouter/)
  done()
})

test('should work on koa@1 with `.legacyMiddleware`', function (done) {
  let router = Router().addRoute('GET /is-it-working', (ctx, next) => {
    ctx.body = 'yea, confirmed'
    return next()
  })
  let app = koa1()

  app.use(router.legacyMiddleware())
  request(app.callback())
    .get('/is-it-working')
    .expect('yea, confirmed')
    .expect(200, done)
})

test('should throw error on `koa@1` using `.middleware`', function (done) {
  function fixture () {
    let failing = Router().addRoute('GET /foo', () => {})
    koa1().use(failing.middleware())
  }
  test.throws(fixture, Error)
  test.throws(fixture, /requires a generator function/)
  done()
})

test('should call options.notFound(ctx, next) if route not found', (done) => {
  let router = Router({
    notFound: (ctx, next) => {
      test.strictEqual(ctx.route, undefined)
      ctx.body = 'not found'
      ctx.status = 404
      return next()
    }
  })
  router.get('/foo', (ctx, next) => {
    ctx.body = 'foo route'
    ctx.status = 200
    return next()
  })

  let app = new Koa()
  app.use(router.middleware())
  app.use((ctx, next) => {
    test.strictEqual(ctx.body, 'not found')
    ctx.body = 'ok not found'
    return next()
  })

  request(app.callback())
    .get('/abc')
    .expect('ok not found')
    .expect(404, done)
})
