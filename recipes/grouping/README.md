# Grouping

There are two kinds of grouping here - grouping routes and grouping routers. In the first one you can group multiple routes in one route, by just using `.groupRoutes` method. Another one is grouping different routers into new one using `.addRoutes`. Say you have one router with 2 routes and another router with just one route. So, you can create third router combining the routes from the first one and the route from the second one.

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