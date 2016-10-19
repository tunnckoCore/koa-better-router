'use strict'

let router = require('../../index')().loadMethods()

router
  .get('/users', (ctx, next) => {
    ctx.body = 'List awesome users!'
    return next()
  })
  .get('/users/new', (ctx, next) => {
    ctx.body = 'Form for creating a new user should be here'
    return next()
  })
  .get('/users/:user', (ctx, next) => {
    ctx.body = `You are looking the ${ctx.params.user} profile!`
    return next()
  })

module.exports = router
