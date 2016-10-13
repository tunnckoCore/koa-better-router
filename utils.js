'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend')
require('inflection')
require('methods')
require('path-match')
require('is-es6-generator-function', 'isGenerator')
require('koa-compose', 'compose')
require('koa-convert', 'convert')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

utils.notImplemented = function notImplemented () {
  return function (ctx, next) {
    // ctx.throw(501)
    ctx.status = 501
    ctx.body = 'Not Implemented'
    return next()
  }
}

utils.r = function r (name, id, edit) {
  name = name !== '' ? `/${name}` : ''
  let url = name + (id ? `/${id}` : '') + (edit ? `/${edit}` : '')
  return url
}

utils.arrayify = function arrayify (val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

utils.defaultController = {
  index: utils.notImplemented(),
  new: utils.notImplemented(),
  create: utils.notImplemented(),
  edit: utils.notImplemented(),
  update: utils.notImplemented(),
  destroy: utils.notImplemented(),
  remove: utils.notImplemented(),
  delete: utils.notImplemented(),
  del: utils.notImplemented()
}

// @todo: move to `koa-rest-router`
utils.cloneArray = function cloneArray (arr) {
  let res = []
  for (const item of arr) {
    res.push(item)
  }
  return res
}

/**
 * @todo: move to `koa-rest-router`
 * make it more flexible
 * to be able to:
 *
 * ```js
 * // /companies/:company/departments/:department/profiles
 * // /companies/:company/departments/:department/profiles/:profile
 * let full = router.extend(companies, departments, profiles)
 *
 * // /companies/:company/departments/:department/profiles/:profile/clients
 * // /companies/:company/departments/:department/profiles/:profile/clients/:client
 * router.extend(full, clients)
 * ```
 */

utils.createPath = function createPath (destRoute, srcRoute, third) {
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
 * Expose `utils` modules
 */

module.exports = utils
