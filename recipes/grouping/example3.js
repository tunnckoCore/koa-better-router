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

  let allRoutes = usersRouter.routes.concat(catsRouter.routes)
  allRoutes = allRoutes.concat(apiRouter.routes)

  allRoutes.forEach(route => {
    console.log(`http://localhost:2222${route.path}`)
  })
})
