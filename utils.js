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
  return utils.typeOf(val) === 'object'
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

/**
 * Expose `utils` modules
 */

module.exports = utils
