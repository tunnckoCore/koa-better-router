/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

let utils = require('./utils')

/**
 * > Initialize `KoaBetterRouter` with optional `options`
 * which are directly passed to [path-match][] and in
 * addition we have one more - `prefix`.
 *
 * **Example**
 *
 * ```js
 * let Router = require('koa-better-router')
 * let router = Router().loadMethods()
 *
 * router.get('/', (ctx, next) => {
 *   ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
 *   return next()
 * })
 *
 * // can use generator middlewares
 * router.get('/foobar', function * (next) {
 *   this.body = `Foo Bar Baz! ${this.route.prefix}`
 *   yield next
 * })
 *
 * let api = Router({ prefix: '/api' })
 *
 * // add `router`'s routes to api router
 * api.extend(router)
 *
 * // The server
 * let Koa = require('koa') // Koa v2
 * let app = new Koa()
 *
 * app.use(router.middleware())
 * app.use(api.middleware())
 *
 * app.listen(4444, () => {
 *   console.log('Try out /, /foobar, /api/foobar and /api')
 * })
 * ```
 *
 * @param {Object} `[options]` options passed to [path-match][] directly
 * @api public
 */

function KoaBetterRouter (options) {
  if (!(this instanceof KoaBetterRouter)) {
    return new KoaBetterRouter(options)
  }

  this.options = utils.extend({ prefix: '/' }, options)
  this.route = utils.pathMatch(this.options)
  this.routes = []
}

/**
 * > Load the HTTP verbs as methods on instance. If you
 * not "load" them you can just use [.addRoute](#addroute) method.
 * If you "load" them, you will have method for each item
 * on [methods][] array - such as `.get`, `.post`, `.put` etc.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')()
 *
 * // all are `undefined` if you
 * // don't `.loadMethods` them
 * console.log(router.get)
 * console.log(router.post)
 * console.log(router.put)
 * console.log(router.del)
 * console.log(router.addRoute) // => function
 * console.log(router.middleware) // => function
 * console.log(router.legacyMiddleware) // => function
 *
 * router.loadMethods()
 *
 * console.log(router.get)  // => function
 * console.log(router.post) // => function
 * console.log(router.put)  // => function
 * console.log(router.del)  // => function
 * console.log(router.addRoute) // => function
 * console.log(router.middleware) // => function
 * console.log(router.legacyMiddleware) // => function
 * ```
 *
 * @return {KoaBetterRouter} `this` instance for chaining
 * @api public
 */

KoaBetterRouter.prototype.loadMethods = function loadMethods () {
  utils.methods.forEach(function (method) {
    let METHOD = method.toUpperCase()
    KoaBetterRouter.prototype[method] =
    KoaBetterRouter.prototype[METHOD] = function httpVerbMethod () {
      let args = [].slice.call(arguments)
      return this.addRoute.apply(this, [METHOD].concat(args))
    }
  })
  KoaBetterRouter.prototype.del = KoaBetterRouter.prototype['delete']
  return this
}

/**
 * > Just creates _"Route Object"_ without adding it to `this.routes` array,
 * used by [.addRoute](#addroute) method.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')({ prefix: '/api' })
 * let route = router.createRoute('GET', '/users', [
 *   function (ctx, next) {},
 *   function (ctx, next) {},
 *   function (ctx, next) {},
 * ])
 *
 * console.log(route)
 * // => {
 * //   prefix: '/api',
 * //   route: '/users',
 * //   pathname: '/users',
 * //   path: '/api/users',
 * //   match: matcher function against `route.path`
 * //   method: 'GET',
 * //   middlewares: array of middlewares for this route
 * // }
 *
 * console.log(route.match('/foobar'))    // => false
 * console.log(route.match('/users'))     // => false
 * console.log(route.match('/api/users')) // => true
 * console.log(route.middlewares.length)  // => 3
 * ```
 *
 * @param {String} `<method>` http verb or `'GET /users'`
 * @param {String|Function} `[route]` for what `ctx.path` handler to be called
 * @param {Function} `...fns` can be array or single function, any number of
 *                            arguments after `route` can be given too
 * @return {Object} plain `route` object with useful properties
 * @api public
 */

KoaBetterRouter.prototype.createRoute = function createRoute (method, route, fns) {
  let args = [].slice.call(arguments, 3)
  let middlewares = utils.arrayify(fns).concat(args)

  if (typeof method !== 'string') {
    throw new TypeError('.createRoute: expect `method` to be a string')
  }

  let parts = method.split(' ')
  method = parts[0].toUpperCase()

  if (typeof route === 'function') {
    middlewares = [route].concat(middlewares)
    route = parts[1]
  }
  if (Array.isArray(route)) {
    middlewares = route.concat(middlewares)
    route = parts[1]
  }
  if (typeof route !== 'string') {
    throw new TypeError('.createRoute: expect `route` be string, array or function')
  }

  let prefixed = utils.createPrefix(this.options.prefix, route)
  return {
    prefix: this.options.prefix,
    path: prefixed,
    route: route,
    match: this.route(prefixed),
    method: method,
    middlewares: middlewares
  }
}

/**
 * > Powerful method to add `route` if you don't want
 * to populate you router instance with dozens of methods.
 * The `method` can be just HTTP verb or `method`
 * plus `route` something like `'GET /users'`.
 * Both modern and generators middlewares can be given too,
 * and can be combined too. **Adds routes to `this.routes` array**.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')()
 *
 * // any number of middlewares can be given
 * // both modern and generator middlewares will work
 * router.addRoute('GET /users',
 *   (ctx, next) => {
 *     ctx.body = `first ${ctx.route.path};`
 *     return next()
 *   },
 *   function * (next) {
 *     this.body = `${this.body} prefix is ${this.route.prefix};`
 *     yield next
 *   },
 *   (ctx, next) => {
 *     ctx.body = `${ctx.body} and third middleware!`
 *     return next()
 *   }
 * )
 *
 * // You can middlewares as array too
 * router.addRoute('GET', '/users/:user', [
 *   (ctx, next) => {
 *     ctx.body = `GET /users/${ctx.params.user}`
 *     console.log(ctx.route)
 *     return next()
 *   },
 *   function * (next) {
 *     this.body = `${this.body}, prefix is: ${this.route.prefix}`
 *     yield next
 *   }
 * ])
 *
 * // can use `koa@1` and `koa@2`, both works
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * app.use(router.middleware())
 * app.listen(4290, () => {
 *   console.log('Koa server start listening on port 4290')
 * })
 * ```
 *
 * @param {String} `<method>` http verb or `'GET /users'`
 * @param {String|Function} `[route]` for what `ctx.path` handler to be called
 * @param {Function} `...fns` can be array or single function, any number of
 *                            arguments after `route` can be given too
 * @return {KoaBetterRouter} `this` instance for chaining
 * @api public
 */

KoaBetterRouter.prototype.addRoute = function addRoute (method, route, fns) {
  let routeObject = this.createRoute.apply(this, arguments)
  this.routes.push(routeObject)
  return this
}

/**
 * > Get a route by `name`. Name of each route is its
 * pathname or route. For example: the `name`
 * of `.get('/cat/foo')` route is `/cat/foo`, but if
 * you pass `cat/foo` - it will work too.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')().loadMethods()
 *
 * router.get('/cat/foo', function (ctx, next) {})
 * router.get('/baz', function (ctx, next) {})
 *
 * console.log(router.getRoute('baz'))      // => Route Object
 * console.log(router.getRoute('cat/foo'))  // => Route Object
 * console.log(router.getRoute('/cat/foo')) // => Route Object
 * ```
 *
 * @param  {String} `name` name of the Route Object
 * @return {Object|Null} Route Object, or `null` if not found
 * @api public
 */

KoaBetterRouter.prototype.getRoute = function getRoute (name) {
  if (typeof name !== 'string') {
    throw new TypeError('.getRoute: expect `name` to be a string')
  }
  let res = null
  for (let route of this.routes) {
    name = name[0] === '/' ? name.slice(1) : name
    if (name === route.route.slice(1)) {
      res = route
      break
    }
  }
  return res
}

/**
 * > Concats any number of arguments (arrays of route objects) to
 * the `this.routes` array. Think for it like
 * registering routes. Can be used in combination
 * with [.createRoute](#createroute) and [.getRoute](#getroute).
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')()
 *
 * // returns Route Object
 * let foo = router.createRoute('GET', '/foo', function (ctx, next) {
 *   ctx.body = 'foobar'
 *   return next()
 * })
 * console.log(foo)
 *
 * let baz = router.createRoute('GET', '/baz/qux', function (ctx, next) {
 *   ctx.body = 'baz qux'
 *   return next()
 * })
 * console.log(baz)
 *
 * // Empty array because we just
 * // created them, didn't include them
 * // as actual routes
 * console.log(router.routes.length) // 0
 *
 * // register them as routes
 * router.addRoutes(foo, baz)
 *
 * console.log(router.routes.length) // 2
 * ```
 *
 * @param {Array} `...args` any number of arguments (arrays of route objects)
 * @return {KoaBetterRouter} `this` instance for chaining
 * @api public
 */

KoaBetterRouter.prototype.addRoutes = function addRoutes () {
  this.routes = this.routes.concat.apply(this.routes, arguments)
  return this
}

/**
 * > Simple method that just returns `this.routes`, which
 * is array of route objects.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')()
 *
 * router.loadMethods()
 *
 * console.log(router.routes.length) // 0
 * console.log(router.getRoutes().length) // 0
 *
 * router.get('/foo', (ctx, next) => {})
 * router.get('/bar', (ctx, next) => {})
 *
 * console.log(router.routes.length) // 2
 * console.log(router.getRoutes().length) // 2
 * ```
 *
 * @return {Array} array of route objects
 * @api public
 */

KoaBetterRouter.prototype.getRoutes = function getRoutes () {
  return this.routes
}

/**
 * > Groups multiple _"Route Objects"_ into one which middlewares
 * will be these middlewares from the last "source". So let say
 * you have `dest` route with 2 middlewares appended to it and
 * the `src1` route has 3 middlewares, the
 * final (returned) route object will have these 3 middlewares
 * from `src1` not the middlewares from `dest`. Make sense?
 * If not this not make sense for you, please open an issue here,
 * so we can discuss and change it (then will change it
 * in the [koa-rest-router][] too, because there the things with
 * method `.groupResource` are the same).
 *
 * **Example**
 *
 * ```js
 * let router = require('./index')({ prefix: '/api/v3' })
 *
 * let foo = router.createRoute('GET /foo/qux/xyz', function (ctx, next) {})
 * let bar = router.createRoute('GET /bar', function (ctx, next) {})
 *
 * let baz = router.groupRoutes(foo, bar)
 * console.log(baz)
 * // => Route Object {
 * //   prefix: '/api/v3',
 * //   path: '/api/v3/foo/qux/sas/bar',
 * //   pathname: '/foo/qux/sas/bar'
 * //   ...
 * // }
 *
 * // Server part
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * router.addRoutes(baz)
 *
 * app.use(router.middleware())
 * app.listen(2222, () => {
 *   console.log('Server listening on http://localhost:2222')
 *
 *   router.getRoutes().forEach((route) => {
 *     console.log(`${route.method} http://localhost:2222${route.path}`)
 *   })
 * })
 * ```
 *
 * @param  {Object} `dest` known as _"Route Object"_
 * @param  {Object} `src1` second _"Route Object"_
 * @param  {Object} `src2` third _"Route Object"_
 * @return {Object} totally new _"Route Object"_ using [.createRoute](#createroute) under the hood
 * @api public
 */

KoaBetterRouter.prototype.groupRoutes = function groupRoutes (dest, src1, src2) {
  if (!utils.isObject(dest) && !utils.isObject(src1)) {
    throw new TypeError('.groupRoutes: expect both `dest` and `src1` be objects')
  }
  let pathname = dest.route + src1.route
  let route = this.createRoute(dest.method, pathname, src1.middlewares)

  return utils.isObject(src2) ? this.groupRoutes(route, src2) : route
}

/**
 * > Extends current router with routes from `router`. This
 * `router` should be an instance of KoaBetterRouter too. That
 * is the **correct extending/grouping** of couple of routers.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')()
 * let api = require('koa-better-router')({
 *   prefix: '/api/v4'
 * })
 *
 * router.addRoute('GET', '/foo/bar', () => {})
 * router.addRoute('GET', '/api/v4/qux', () => {}) // intentional !
 * api.addRoute('GET', '/woohoo')
 *
 * api.extend(router)
 *
 * api.getRoutes().forEach(route => console.log(route.path))
 * // => outputs (the last one is expected)
 * // /api/v4/woohoo
 * // /api/v4/foo/bar
 * // /api/v4/api/v4/qux
 * ```
 *
 * @param  {Object} `<router>` instance of KoaBetterRouter
 * @return {KoaBetterRouter} `this` instance for chaining
 * @api public
 */

KoaBetterRouter.prototype.extend = function extend (router) {
  if (!(router instanceof KoaBetterRouter)) {
    throw new TypeError('.extend: expect `router` to be instance of KoaBetterRouter')
  }
  router.routes.forEach((route) => {
    if (route.prefix !== this.options.prefix) {
      route = utils.updatePrefix(this, this.options, route)
    }

    this.routes.push(route)
  })
  return this
}

/**
 * > Active all routes that are defined. You can pass `opts`
 * to pass different `prefix` for your routes. So you can
 * have multiple prefixes with multiple routes using just
 * one single router. You can also use multiple router instances.
 * Pass `legacy: true` to `opts` and you will get generator function
 * that can be used in Koa v1.
 *
 * **Example**
 *
 * ```js
 * let Router = require('koa-better-router')
 * let api = Router({ prefix: '/api' })
 *
 * api.loadMethods()
 *   .get('GET /', (ctx, next) => {
 *     ctx.body = 'Hello world!'
 *     return next()
 *   }, (ctx, next) => {
 *     ctx.body = `${ctx.body} Try out /api/users too`
 *     return next()
 *   })
 *
 * api.get('/users', function * (next) {
 *   this.body = `Prefix: ${this.route.prefix}, path: ${this.route.path}`
 *   yield next
 * })
 *
 * // Server part
 * let Koa = require('koa')
 * let app = new Koa()
 *
 * // Register the router as Koa middleware
 * app.use(api.middleware())
 *
 * app.listen(4321, () => {
 *   console.log('Modern Koa v2 server is started on port 4321')
 * })
 * ```
 *
 * @return {Function} modern [koa][] v2 middleware
 * @api public
 */

KoaBetterRouter.prototype.middleware = function middleware () {
  return (ctx, next) => {
    for (let route of this.routes) {
      if (ctx.method !== route.method) {
        continue
      }

      // - if there's a match and no params it will be empty object!
      // - if there are some params they will be here
      // - if path not match it will be boolean `false`
      let match = route.match(ctx.path, ctx.params)
      if (!match) {
        continue
      }

      route.params = match
      route.middlewares = route.middlewares.map((fn) => {
        return utils.isGenerator(fn) ? utils.convert(fn) : fn
      })

      // may be useful for the user
      ctx.route = route
      ctx.params = route.params

      // calls next middleware on success
      // returns rejected promises on error
      return utils.compose(route.middlewares)(ctx).then(() => next())
    }
    // called when request path not found on routes
    // ensure calling next middleware which is after the router
    return next()
  }
}

/**
 * > Explicitly use this method when want
 * to use the router on **Koa@1**,
 * otherwise use [.middleware](#middleware) method!
 *
 * **Example**
 *
 * ```js
 * let app = require('koa')() // koa v1.x
 * let router = require('koa-better-router')()
 *
 * router.addRoute('GET', '/users', function * (next) {
 *   this.body = 'Legacy KOA!'
 *   yield next
 * })
 *
 * app.use(router.legacyMiddleware())
 * app.listen(3333, () => {
 *   console.log('Open http://localhost:3333/users')
 * })
 * ```
 *
 * @return {GeneratorFunction} old [koa][] v1 middleware
 * @api public
 */

KoaBetterRouter.prototype.legacyMiddleware = function legacyMiddleware () {
  return utils.convert.back(this.middleware())
}

/**
 * Expose `KoaBetterRouter` constructor
 *
 * @type {Function}
 * @api private
 */

module.exports = KoaBetterRouter
