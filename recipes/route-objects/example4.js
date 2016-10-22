'use strict'

let fooRouter = require('../../index')()
let bodyParser = require('koa-better-body')()

// load shortcut methods :P
fooRouter.loadMethods()

// get the html form
let form = require('./form')

fooRouter
  .get('/', function (ctx, next) {
    let state = { place: 'World, haha!' }
    ctx.body = `${form(ctx, state)} <div>Footer here</div>`
    ctx.type = 'html'
    return next()
  })
  .post('/comment', [
    bodyParser,
    (ctx, next) => {
      ctx.body = `You just commented something`
      return next()
    },
    function * (next) {
      let data = this.request.fields // comes from `koa-better-body`
      data = JSON.stringify(data, null, 2)

      // prepend body from previous (above) middleware
      this.body = `${this.body} and`

      // append more to the body
      this.body = `${this.body} your submited data is ${data}, that's great!`
      yield next
    }
  ])

let Koa = require('koa') // koa v2
let app = new Koa()

app.use(fooRouter.middleware())

app.listen(5000, () => {
  console.log('Open http://localhost:5000/')
})
