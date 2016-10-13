/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var Koa = require('koa')
var router = require('./index')()
var app = new Koa()

var indexMw = [function fn1 (ctx, next) {
  ctx.body = 'GET / - new middleware and'
  return next()
}, function fn2 (ctx, next) {
  ctx.body = ctx.body + ' old middleware'
  return next()
}]

router.get('/foo', function (ctx, next) {
  ctx.body = 'foo foo foo'
  return next()
})

var companies = router.resource('companies', {
  index: indexMw,
  new: function (ctx, next) {
    ctx.body = 'companies: GET /companies/new'
    return next()
  },
  show: [function * (next) {
    this.body = `companies: old mw`
    yield next
  }, function (ctx, next) {
    ctx.body = `${ctx.body} and NEW - GET /companies/${ctx.params.company}`
    return next()
  }]
})
var departments = router.resource('departments', {
  index: indexMw,
  new: function (ctx, next) {
    ctx.body = 'departments: GET /departments/new'
    return next()
  },
  show: [function * (next) {
    this.body = `departments: old mw`
    yield next
  }, function (ctx, next) {
    ctx.body = `${ctx.body} and NEW - GET /departments/${ctx.params.department}`
    return next()
  }]
})
var profiles = router.resource('profiles', {
  index: indexMw,
  new: function (ctx, next) {
    ctx.body = 'profiles: GET /profiles/new'
    return next()
  },
  show: [function * (next) {
    this.body = `profiles: old mw`
    yield next
  }, function (ctx, next) {
    ctx.body = `${ctx.body} and NEW - GET /profiles/${ctx.params.profile}`
    ctx.body += JSON.stringify(ctx.params, null, 2)
    return next()
  }]
})

// so:
// /companies
// /departments
// /profiles
//
// /companies
// /companies/111
// /companies/:company/profiles
// /companies/:company/profiles/3545
//
// /companies/:company/departments
// /companies/:company/departments/333
// /companies/:company/departments/:department/profiles
// /companies/:company/departments/:department/profiles/3545
// router.extend(companies, departments)
// router.extend(companies, profiles)
// router.extend(companies, departments)
router.extend(companies, departments, profiles)

router.get('/bar', function (ctx, next) {
  ctx.body = 'bar bar bar'
  return next()
})

router._routes.forEach(function (route) {
  console.log(route.method, route.path)
})

app.use(router.middleware())
app.use(function () {
  console.log('last')
})

// app.listen(5555)
