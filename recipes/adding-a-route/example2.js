'use strict'

let body = require('koa-better-body')()
let router = require('../../index')()
let form = require('./form')

router.addRoute('GET', '/foo/bar', function (ctx, next) {
  ctx.type = 'html'
  ctx.body = `<h1>Hello World!</h1> ${form(ctx)}`
  return next()
})

router.addRoute('POST', '/form', [
  body,
  function * (next) {
    this.body = `Your form is successfuly submitted. Route: ${this.route.path}.`
    yield next
  },
  (ctx, next) => {
    let data = JSON.stringify(ctx.request.fields, null, 2)
    ctx.type = 'html'
    ctx.body = `<h1>Success</h1><div>${ctx.body} <br>Submitted form data is ${data}</div>`
    return next()
  }
])

// Server
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.listen(4321, () => {
  console.log('Server listening on http://localhost:4321')

  router.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4321${route.path}`)
  })
})
