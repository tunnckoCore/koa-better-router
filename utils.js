'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend')
require('methods')
require('path-match')
require('is-es6-generator-function', 'isGenerator')
require('koa-compose', 'compose')
require('koa-convert', 'convert')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

utils.typeOf = function typeOf (val) {
  return Array.isArray(val) ? 'array' : typeof val
}

utils.isObject = function isObject (val) {
  return val && utils.typeOf(val) === 'object'
}

utils.arrayify = function arrayify (val) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}

utils.createPrefix = function createPrefix (prefix, pathname) {
  let path = pathname.replace(/^\/|\/$/, '')
  let clean = prefix.replace(/^\/|\/$/, '')
  clean = clean.length > 0 ? `/${clean}` : clean
  return `${clean}/${path}`
}

utils.updatePrefix = function updatePrefix (ctx, opts, src) {
  let prefixed = utils.createPrefix(opts.prefix, src.route)
  let route = utils.extend({}, src)
  route.prefix = opts.prefix
  route.path = prefixed
  route.match = ctx.route(prefixed)
  return route
}

/**
 * Expose `utils` modules
 */

module.exports = utils
