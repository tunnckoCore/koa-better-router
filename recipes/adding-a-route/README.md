# Adding a route

In this recipes you learn more about how to add a route to your router and more things that you should be aware of.

By default this router comes with no methods such as `.get`, `.post` and etc HTTP verbs. If you want them you should call `.loadMethods` before anything other.

**Example 1**

```js
let Router = require('koa-better-router')
let api = new Router() // or just without `new`, it is smart enough

console.log(typeof api.get) // => undefined
console.log(typeof api.put) // => undefined
console.log(typeof api.post) // => undefined

api.loadMethods()

console.log(typeof api.get) // => function
console.log(typeof api.put) // => function
console.log(typeof api.post) // => function
```

All this is intentional, because we have the powerful `.addRoute` method. It is smart enough to understand few variants of signatures. The first one, you may be seen in other routes too.

### `.addRoute(String, String, ...)` - `.addRoute('GET', '/foo/bar', ...)`

First argment is HTTP verb, such as GET/POST/DELETE/PUT. Actually it can be any of the listed in [methods](http://ghub.io/methods) library. The second one is `route` or path to which you want to add middleware, such as `/foo/bar`. Any of arguments after the second are considered middleware functions. 

Or third argument can be array of middleware functions. Middlewares can be both normal functions, also called _"modern"_ - koa v2, or generator functions, known as _"old"_ middleware - koa v1.

**Example 2**

```js
let body = require('koa-better-body')()
let router = require('koa-better-router')()
let form = require('./form')
let result = require('./result')

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
```

### `.addRoute(String, ...)` - `.addRoute('GET /foo/bar', ...)`

Or the another signature is just sugar for above. You can pass signle string as first argument, which string may look like `'GET /users'`.

**Example 3**

```js
let Router = require('koa-better-router')
let router = new Router({ prefix: '/api' })

router.addRoute('GET /users', (ctx, next) => {
  ctx.body = `Route is ${ctx.route.path}`
  return next()
})

// Server
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.listen(4444, () => {
  console.log('Open http://localhost:4444/api/users')
})
```

You may notice from above example that you can pass different prefixes for your router. But you also can add this `prefix` option to the `.middleware` method, so you can have multiple prefixes on same router. Just see below example.

**Example 4**

```js
let router = require('koa-better-router')({
  prefix: '/api'
})

router.addRoute('GET /users', (ctx, next) => {
  ctx.body = `Route is ${ctx.route.route} and prefix is ${ctx.route.prefix}`
  ctx.body = `${ctx.body}. So path is ${ctx.route.path}`
  return next()
})

// Server
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.use(router.middleware({ prefix: '/foo' }))

app.listen(3333, () => {
  console.log('Open http://localhost:3333/api/users')
  console.log('And try http://localhost:3333/foo/users')
})
```