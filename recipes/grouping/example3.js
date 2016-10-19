'use strict'

let usersRouter = require('./users-router')
let catsRouter = require('./cats-router')
let apiRouter = require('../../index')({
  prefix: '/api'
})

// adds routes from usersRouter
// to the apiRouter, then does same thing
// for the catsRouter (.extend returns `this`)
apiRouter.extend(usersRouter).extend(catsRouter)

// Server
let Koa = require('koa') // koa v2
let app = new Koa()

// add the three routers to your app
app.use(usersRouter.middleware())
app.use(catsRouter.middleware())
app.use(apiRouter.middleware())

app.listen(2222, () => {
  console.log('Your server is awesome!')
  console.log('You will have these routes:')

  // such as http://localhost:2222/users/new
  usersRouter.routes.forEach(route => {
    console.log(`http://localhost:2222${route.path}`)
  })
  // such as http://localhost:2222/cats/new
  catsRouter.routes.forEach(route => {
    console.log(`http://localhost:2222${route.path}`)
  })
  // http://localhost:2222/api/users/new
  // http://localhost:2222/api/cats/new
  // etc...
  apiRouter.routes.forEach(route => {
    console.log(`http://localhost:2222${route.path}`)
  })
})
