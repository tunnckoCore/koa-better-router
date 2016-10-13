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

/**
 * Expose `utils` modules
 */

module.exports = utils
