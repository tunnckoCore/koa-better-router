/*!
 * koa-better-router <https://github.com/tunnckoCore/koa-better-router>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

let utils = require('./utils')

function KoaBetterRouter (options) {
  if (!(this instanceof KoaBetterRouter)) {
    return new KoaBetterRouter(options)
  }

  this.options = utils.extend({ prefix: '/' }, options)
  this.routes = []
  this.route = utils.pathMatch(this.options)
}

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

KoaBetterRouter.prototype.legacyMiddleware = function legacyMiddleware () {
  return utils.convert.back(this.middleware())
}

module.exports = KoaBetterRouter
