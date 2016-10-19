# Grouping

There are two kinds of grouping here - grouping routes and grouping routers. In the first one you can group multiple routes in one route, by just using `.groupRoutes` method. Another one is grouping different routers into new one using `.extend` method. Say you have one router with 2 routes and another router with just one route. So, you can create third router combining the routes from the first one and the route from the second one.

## Grouping routes

Let's create two routes - `/foo/bar` and `/baz/qux`, using `.createRoute` method and group them to form one that you can access navigating to `/foo/bar/baz/qux` route.

#### Example 1

Try it with `node recipes/grouping/example1.js` from the root directory of the project.

```js
let router = require('koa-better-router')()

let foo = router.createRoute('GET /foo/bar', (ctx, next) => {
  ctx.body = 'This is /foo/bar route!'
  return next()
})
console.log(foo.route) // => '/foo/bar'
console.log(foo.middlewares.length) // => 1

let baz = router.createRoute('GET /baz/qux', (ctx, next) => {
  ctx.body = `Woo hoo, this is ${ctx.route.path}!`
  return next()
})
console.log(baz.route) // => '/baz/qux'
console.log(baz.middlewares.length) // => 1

// group them
let combined = router.groupRoutes(foo, baz)
console.log(combined.route) // => '/foo/bar/baz/qux'
console.log(combined.middlewares.length) // => 1

router.addRoutes(combined)

// there's only one route in routes array
console.log('routes number:', router.getRoutes().length) // => 1

// Server
let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(router.middleware())

app.listen(2222, () => {
  console.log('Open http://localhost:2222/foo/bar/baz/qux')
})
```

Okey, great. But there might have something strange for you, right? When you open `/foo/bar/baz/qux` route you just seen the body of `/baz/qux` route and there's only one middleware in the the `combined` route, right? This is in that way, because it overrides the middlewares from the first `/foo/bar` route with the middlewares from the second `/baz/qux` route. And that's intentional, because I think it make more sense in the most cases.

Actually, more sense, in RESTful APIs. **To trick this** behavior you might need to do such combining in different way. Such as below example

#### Example 2

```js
let router = require('koa-better-router')()

let foo = router.createRoute('GET /foo/bar', (ctx, next) => {
  ctx.body = 'Hello FooBar!'
  return next()
})
let baz = router.createRoute('GET /baz/qux', (ctx, next) => {
  // notice that you should also prepend/append
  // the body from `/foo/bar` route
  ctx.body = `${ctx.body} Woo hoo, this is ${ctx.route.path}!`
  return next()
})

// group them by concating
// middlewares of both routes
baz.middlewares = foo.middlewares.concat(baz.middlewares)

let combined = router.groupRoutes(foo, baz)
console.log(combined.route) // => '/foo/bar/baz/qux'

// notice that there are two middlewares, not just one
console.log(combined.middlewares.length) // => 2

// "register" the new route
router.addRoutes(combined)

// Server
let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(router.middleware())

app.listen(3232, () => {
  console.log('Open http://localhost:3232/foo/bar/baz/qux')
})
```

Try it out using `node recipes/grouping/example2.js` and you will see bodies from both routes when you open localhost and navigate to `/foo/bar/baz/qux` page. 

## Correct extending routers

Okey, we already know how to group different routes. But what about if we want to group different routers into one API router. Let's say we have one router for the `users` and another for `cats`, what we should do then? It's easy. We initializing one router, use `.extend` on it to create three routes for users - one for listing the users, another for creating a user and third route for showing specific user. And second router that does same things but for cats. And all this we want to be accessible through the `/api` endpoint.

**ProTip:** better use [koa-rest-router](http://ghub.io/koa-rest-router) for such things.

That's easy with just creating third router with `prefix: '/api'` option and using `.extend` method to combine `usersRouter` and `catsRouter`. Let's build the example.

#### Example 3

Try it out with `node recipes/grouping/example3.js`. The `users-router.js` and `cats-router.js` are below this example and they are actual files on this recipe folder.

```js
let usersRouter = require('./users-router')
let catsRouter = require('./cats-router')
let apiRouter = require('koa-better-router')({
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
```

I'll separate them in different files for more clean view.

**users-router.js**

```js
let router = require('koa-better-router')().loadMethods()

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
```

and **cats-router.js**

```js
let catsRouter = require('koa-better-router')().loadMethods()

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
```

Hope this clarify the things? Please open an issue or pull request if there's something that is not clear enough.

You can just do what you want with such flexibility. 

## Incorrect extending of routers

Actually extending a router can be done in one more variant by just using `.addRoutes(usersRouter.routes, catsRouter.routes)` but later if you wanna print them like I did in the `.listen`  you will get unexpected results as output.

Let's use above example, but replace

```js
// adds routes from usersRouter
// to the apiRouter, then does same thing
// for the catsRouter (.extend returns `this`)
apiRouter.extend(usersRouter).extend(catsRouter)
```

with this to use `.addRoutes` instead

```js
// combine them
apiRouter.addRoutes(usersRouter.routes, catsRouter.routes)
```

and try to output the actual routes of `apiRouter`

```js
app.listen(2222, () => {
  apiRouter.routes.forEach(route => {
    console.log(`http://localhost:2222${route.path}`)
  })
})
```

 you will get such results

```shell
http://localhost:6666/users
http://localhost:6666/users/new
http://localhost:6666/users/:user
http://localhost:6666/cats
http://localhost:6666/cats/new
http://localhost:6666/cats/:cat
```

but actually when you open `http://localhost:6666/users` for example you don't have such route, but when open `http://localhost:6666/api/users` you have correct body. It is because `.middleware` does the trick under the hood and it is smart enough to understand what happens, but does not updates the `apiRouter.routes` array. So if you want to output router routes later in you application you **must not** rely on the `.addRoutes` and **should use** `.extend` method.