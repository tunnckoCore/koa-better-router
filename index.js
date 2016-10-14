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
 * which are directtly passed to `path-match` and in
 * addition we have two more `legacy` and `prefix`.
 *
 * **Example**
 *
 * ```js
 * let router = require('koa-better-router')
 * let api = router({ prefix: '/api' }).loadMethods()
 *
 * api.get('/', (ctx, next) => {
 *   ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
 *   return next()
 * })
 *
 * // can use generator middlewares
 * api.get('/foobar', function * (next) {
 *   this.body = `Foo Bar Baz! ${ctx.route.prefix}`
 *   yield next
 * })
 *
 * let Koa = require('koa') // Koa v2
 * let app = new Koa()
 *
 * app.use(api.middleware())
 * app.use(api.middleware({ prefix: '/' }))
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
 * not "load" them you can just use `.addRoute` method.
 * If you "load" them, you will have method for each item
 * on [methods][] array - such as `.get`, `.post`, `.put` etc.
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
 * > Powerful method to do the routing if you don't want
 * to populate you router instance with dozens of methods.
 * The `method` can be just HTPP method or method
 * plus `pathname` something like `'GET /users'`.
 * Both modern and generators middlewares can be given too,
 * and can be combined too.
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
 *   function * (next) => {
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
 * @param {String|Function} `[pathname]` for what `ctx.path` handler to be called
 * @param {Function} `...fns` can be array or single function, any number of
 *                            arguments after `pathname` can be given too
 * @return {KoaBetterRouter} `this` instance for chaining
 * @api public
 */

KoaBetterRouter.prototype.addRoute = function addRoute (method, pathname, fns) {
  let args = [].slice.call(arguments, 3)
  let middlewares = utils.arrayify(fns).concat(args)

  if (typeof method !== 'string') {
    throw new TypeError('.addRoute: expect `method` to be a string')
  }

  let parts = method.split(' ')
  method = parts[0] || 'get'
  method = method.toUpperCase()

  if (typeof pathname === 'function') {
    middlewares = [pathname].concat(middlewares)
    pathname = parts[1]
  }
  if (Array.isArray(pathname)) {
    middlewares = pathname.concat(middlewares)
    pathname = parts[1]
  }
  if (typeof pathname !== 'string') {
    throw new TypeError('.addRoute: expect `pathname` be string, array or function')
  }

  let prefixed = utils.createPrefix(this.options.prefix, pathname)
  this.routes.push({
    prefix: this.options.prefix,
    path: prefixed,
    pathname: pathname,
    match: this.route(prefixed),
    method: method,
    middlewares: middlewares
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
 * let api = new Router({ prefix: '/api' })
 * let router = Router({ legacy: true })
 *
 * router.loadMethods().get('GET /',
 *   (ctx, next) => {
 *     ctx.body = 'Hello world!'
 *     return next()
 *   },
 *   (ctx, next) => {
 *     ctx.body = `${ctx.body} Try out /api/users and /foo/users`
 *     return next()
 *   })
 *
 * api.loadMethods()
 * api.get('/users', function * (next) {
 *   this.body = `Prefix: ${this.route.prefix}, path: ${this.route.pathname}`
 *   yield next
 * })
 *
 * let app = require('koa')() // koa v1
 *
 * // no need to pass `legacy`, because of the constructor options
 * app.use(router.middleware())
 *
 * // initialize `api` router with `legacy true`,
 * // because we don't have legacy defined in api router constructor
 * app.use(api.middleware(true))
 * app.use(api.middleware({ legacy: true, prefix: '/foo' }))
 *
 * app.listen(4321, () => {
 *   console.log('Legacy Koa v1 server is started on port 4321')
 * })
 * ```
 *
 * @param  {Object|Boolean} `[opts]` optional, safely merged with options from constructor,
 *   if you pass boolean true, it understands it as `opts.legacy`,
 * @return {GeneratorFunction|Function} by default modern [koa][] middleware
 *   function, but if you pass `opts.legacy: true` it will return generator function
 * @api public
 */

KoaBetterRouter.prototype.middleware = function middleware (opts) {
  opts = typeof opts === 'object'
    ? utils.extend({ legacy: false }, opts)
    : { legacy: opts }
  opts.legacy = typeof opts.legacy === 'boolean'
    ? opts.legacy
    : false

  // allows multiple prefixes
  // on one router
  let options = utils.extend({}, this.options, opts)
  this.options = options

  return this.options.legacy
    ? this.legacyMiddleware()
    : (ctx, next) => {
      for (const route of this.routes) {
        if (ctx.method !== route.method) {
          continue
        }
        if (options.prefix !== route.prefix) {
          let prefixed = utils.createPrefix(options.prefix, route.pathname)
          route.prefix = options.prefix
          route.path = prefixed
          route.match = this.route(prefixed)
        }

        let params = route.match(ctx.path, ctx.params)
        if (!params) {
          continue
        }

        route.params = params
        route.middlewares = route.middlewares.map((fn) => {
          if (utils.isGenerator(fn)) {
            return utils.convert(fn)
          }
          return fn
        })

        // may be useful for the user
        ctx.route = route
        ctx.params = params

        utils.compose(route.middlewares)(ctx)
      }
      return next()
    }
}

/**
 * > Converts the modern middleware routes to generator functions
 * using [koa-convert][].back under the hood. It is sugar for
 * the `.middleware(true)` or `.middleware({ legacy: true })`
 *
 * @return {Function|GeneratorFunction}
 * @api public
 */

KoaBetterRouter.prototype.legacyMiddleware = function legacyMiddleware () {
  return utils.convert.back(this.middleware())
}

module.exports = KoaBetterRouter
