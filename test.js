/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

let Koa = require('koa')
let Router1 = require('./index')
let Router2 = require('./index')
let app = new Koa()
let apiRouter = new Router1({ prefix: '/api' })

apiRouter.loadMethods()
  .get('/users', function (ctx, next) {
    ctx.body = 'GET /api/users'
    return next()
  })
  .get('/users/:user', function (ctx, next) {
    ctx.body = `GET /api/users/${ctx.params.user}`
    return next()
  })
app.use(apiRouter.middleware())

// @todo: two totally different instances
// of the router ... and there are conflicts..
//
let router = new Router2({ prefix: '/' })
router.loadMethods().get('/foo', (ctx, next) => {
  ctx.body = 'Hello world! Try /api/users or /api/users/123'
  return next()
})

app.use(router.middleware())

// app.listen(3222, function () {
//   console.log('Server listening on http://localhost:3222')
// })

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
