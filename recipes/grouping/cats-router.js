'use strict'

let catsRouter = require('../../index')().loadMethods()

module.exports = catsRouter.get('/cats', function (ctx, next) {
  ctx.body = `List your cute cats! ${ctx.route.path}`
  return next()
})
.get('/cats/new', (ctx, next) => {
  ctx.body = 'Add your cat here!'
  return next()
})
.get('/cats/:cat', (ctx, next) => {
  ctx.body = `Profile of ${ctx.params.cat} cat!`
  return next()
})
