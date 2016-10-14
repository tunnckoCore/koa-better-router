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

test('should have `.addRoute`, `.middleware` and `legacyMiddlewares` methods', function (done) {
  test.strictEqual(typeof router.addRoute, 'function')
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

test('should `.addRoute` throw TypeError if `method` a string', function (done) {
  function fixture () {
    router.addRoute(123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `method` to be a string/)
  done()
})

test('should `.addRoute` throw TypeError pathname not a string, array or function', function (done) {
  function fixture () {
    router.addRoute('GET', 123)
  }
  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `pathname` be string, array or function/)
  done()
})

test('should `.addRoute` be able to accept single function as `pathname`', function (done) {
  let apiRouter = Router()
  apiRouter.addRoute('GET /users', function (ctx, next) {})
  done()
})

test('should `.addRoute` accept `pathname` to be array of middlewares', function (done) {
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

// var indexMw = [function fn1 (ctx, next) {
//   ctx.body = 'GET / - new middleware and'
//   return next()
// }, function fn2 (ctx, next) {
//   ctx.body = ctx.body + ' old middleware'
//   return next()
// }]

// router.get('/foo', function (ctx, next) {
//   ctx.body = 'foo foo foo'
//   return next()
// })

// var companies = router.resource('companies', {
//   index: indexMw,
//   new: function (ctx, next) {
//     ctx.body = 'companies: GET /companies/new'
//     return next()
//   },
//   show: [function * (next) {
//     this.body = `companies: old mw`
//     yield next
//   }, function (ctx, next) {
//     ctx.body = `${ctx.body} and NEW - GET /companies/${ctx.params.company}`
//     return next()
//   }]
// })
// var departments = router.resource('departments', {
//   index: indexMw,
//   new: function (ctx, next) {
//     ctx.body = 'departments: GET /departments/new'
//     return next()
//   },
//   show: [function * (next) {
//     this.body = `departments: old mw`
//     yield next
//   }, function (ctx, next) {
//     ctx.body = `${ctx.body} and NEW - GET /departments/${ctx.params.department}`
//     return next()
//   }]
// })
// var profiles = router.resource('profiles', {
//   index: indexMw,
//   new: function (ctx, next) {
//     ctx.body = 'profiles: GET /profiles/new'
//     return next()
//   },
//   show: [function * (next) {
//     this.body = `profiles: old mw`
//     yield next
//   }, function (ctx, next) {
//     ctx.body = `${ctx.body} and NEW - GET /profiles/${ctx.params.profile}`
//     ctx.body += JSON.stringify(ctx.params, null, 2)
//     return next()
//   }]
// })

// var clients = router.resource('clients', {
//   index: indexMw,
//   new: function (ctx, next) {
//     ctx.body = 'clients: GET /clients/new'
//     return next()
//   },
//   show: [function * (next) {
//     this.body = `clients: old mw`
//     yield next
//   }, function (ctx, next) {
//     ctx.body = `${ctx.body} and NEW - GET /clients/${ctx.params.client}`
//     ctx.body += JSON.stringify(ctx.params, null, 2)
//     return next()
//   }]
// })

// so:
// /companies
// /companies/:company
//
// /departments
// /departments/:department
//
// /profiles
// /profiles/:profile
//
// /companies/:company/departments
// /companies/:company/departments/:department
//
// /companies/:company/profiles
// /companies/:company/profiles/:profile
//
// /companies/:company/departments/:department/profiles
// /companies/:company/departments/:department/profiles/:profile
//
// router.extend(companies, departments)
// router.extend(companies, profiles)
// router.extend(companies, departments, profiles)

// let full = router.extend(companies, departments, profiles)
// router.extend(full, clients)
// // => for such thing:
// /companies/:company/departments/:department/profiles/:profile/clients
// /companies/:company/departments/:department/profiles/:profile/clients/:client

// router.get('/bar', function (ctx, next) {
//   ctx.body = 'bar bar bar'
//   return next()
// })

// router._routes.forEach(function (route) {
//   console.log(route.method, route.path)
// })

// app.use(router.middleware())
// app.use(function () {
//   console.log('last')
// })

// app.listen(5555)
