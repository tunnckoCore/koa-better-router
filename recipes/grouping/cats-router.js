'use strict'

let catsRouter = require('../../index')().loadMethods()

catsRouter
  .get('/cats', (ctx, next) => {
    ctx.body = 'List awesome cats!'
    return next()
  })
  .get('/cats/new', (ctx, next) => {
    ctx.body = 'Form for creating a new cat should be here'
    return next()
  })
  .get('/cats/:cat', (ctx, next) => {
    ctx.body = `You are looking the ${ctx.params.cat} profile!`
    return next()
  })

module.exports = catsRouter
