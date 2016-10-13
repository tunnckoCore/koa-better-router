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
  this.options = utils.extend({}, options)
  this._routes = []
  this._endpoints = {}
  this.route = utils.pathMatch(this.options)
  utils.methods.forEach(function (method) {
    this[method] = function () {
      let args = [].slice.call(arguments)
      let METHOD = method.toUpperCase()
      return this.addRoute.apply(this, [METHOD].concat(args))
    }
  }, this)
  this.del = this['delete']
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

  this._routes.push({
    path: pathname,
    match: this.route(pathname),
    method: method,
    middlewares: middlewares
  })
  return this
}

KoaBetterRouter.prototype.middleware = function middleware () {
  return (ctx, next) => {
    for (const route of this._routes) {
      if (ctx.method !== route.method) {
        continue
      }

      let params = route.match(ctx.path, ctx.params)
      if (!params) continue

      ctx.params = params
      route.middlewares = route.middlewares.map((fn) => {
        if (utils.isGenerator(fn)) {
          return utils.convert(fn)
        }
        return fn
      })

      return utils.compose(route.middlewares)(ctx).then(() => next())
    }
  }
}

KoaBetterRouter.prototype.legacyMiddleware = function legacyMiddleware () {
  return utils.convert.back(this.middleware())
}
KoaBetterRouter.prototype.extend = function extend (dest, src1, src2) {
  let res = []
  let len = dest.length
  let i = 0

  while (i < len) {
    let idx = i++
    let destRoute = dest[idx]
    let srcRoute = src1[idx]
    let pathname = createPath(destRoute, srcRoute)
    let route = {
      path: pathname,
      match: this.route(pathname),
      middlewares: srcRoute.middlewares,
      method: srcRoute.method
    }

    if (src2) {
      let extraRoute = src2[idx]
      pathname = createPath(route, extraRoute, true)
      route = {
        path: pathname,
        match: this.route(pathname),
        middlewares: extraRoute.middlewares,
        method: extraRoute.method
      }
    }

    res.push(route)
    this._routes.push(route)
  }
  return res
}

function createPath (destRoute, srcRoute, third) {
  let destParts = destRoute.path.split('/')
  let srcParts = srcRoute.path.split('/')
  let singular = third
    ? utils.inflection.singularize(destParts[3])
    : utils.inflection.singularize(destParts[1])
  let len = third ? 4 : 2
  let part3 = third ? destParts[5] : destParts[3]

  if (destParts.length === len) {
    destParts.push(`:${singular}`)
  }
  if (destParts[2] === 'new') {
    destParts[2] = `:${singular}`
  }
  if (third && destParts[4] === 'new') {
    destParts[4] = `:${singular}`
  }
  if (part3 === 'edit') {
    destParts = destParts.slice(0, -1)
  }

  let path = destParts.concat(srcParts).filter(Boolean)
  return '/' + path.join('/')
}

/**

  let destParts = destRoute.path.split('/')
  let srcParts = srcRoute.path.split('/')
  let singular = third
    ? utils.inflection.singularize(destParts[1])
    : utils.inflection.singularize(destParts[3])

  if (destParts.length === 2) {
    destParts.push(`:${singular}`)
  }
  if (third && destParts.length === 3) {
    destParts.push(`:${singular}`)
  }
  if (destParts[2] === 'new') {
    destParts[2] = `:${singular}`
  }
  if (third && destParts[3] === 'new') {
    destParts[3] = `:${singular}`
  }
  if (destParts[3] === 'edit') {
    destParts = destParts.slice(0, -1)
  }
  if (third && destParts[4] === 'edit') {
    destParts = destParts.slice(0, -1)
  }

  let path = destParts.concat(srcParts).filter(Boolean)
  console.log(path)
  return '/' + path.join('/')

 */

KoaBetterRouter.prototype.resource = function resource (name, ctrl, opts) {
  if (typeof name === 'object') {
    ctrl = name
    name = '/'
  }
  if (typeof name !== 'string') {
    name = '/'
  }
  let pathname = name !== '/'
    ? utils.inflection.pluralize(name)
    : ''
  let param = name !== '/'
    ? ':' + utils.inflection.singularize(name)
    : ':id'

  let oldRoutes = cloneArray(this._routes)
  this._routes = []
  ctrl = utils.extend({}, utils.defaultController, ctrl)
  this
    .get(utils.r(pathname), ctrl.index)
    .get(utils.r(pathname, 'new'), ctrl.new)
    .post(utils.r(pathname), ctrl.create)
    .get(utils.r(pathname, param), ctrl.show)
    .get(utils.r(pathname, param, 'edit'), ctrl.edit)

    // auto-handle updates
    // PUT     /users/:user       ->  update
    // POST    /users/:user       ->  update
    // PATCH   /users/:user       ->  update
    .put(utils.r(pathname, param), ctrl.update)
    .post(utils.r(pathname, param), ctrl.update)
    .patch(utils.r(pathname, param), ctrl.update)

    // auto-handle deletes
    // DELETE   /users/:user       ->  destroy
    // DELETE   /users/:user       ->  remove
    // DELETE   /users/:user       ->  delete
    // DELETE   /users/:user       ->  del
    .del(utils.r(pathname, param), ctrl.destroy)
    .del(utils.r(pathname, param), ctrl.remove)
    .del(utils.r(pathname, param), ctrl.delete)
    .del(utils.r(pathname, param), ctrl.del)

  let srcRoutes = cloneArray(this._routes)
  this._routes = oldRoutes.concat(srcRoutes)
  return srcRoutes
}

module.exports = KoaBetterRouter

function cloneArray (arr) {
  let res = []
  for (const item of arr) {
    res.push(item)
  }
  return res
}
