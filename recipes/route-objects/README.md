# What is the _"Route Object"_?

You may noticed that in the API docs it is used in a couple of place. And you may be curious what it is, or why there are two equivalent methods such as `.createRoute` and `.addRoute`, and what are the differences between them.

Initially there was only one `.addRoute` method, which was doing the all stuff. But while building the [koa-rest-router](http://ghub.io/koa-rest-router) I needed just raw and plain route object that I can modify and extend. So returned back here and decouple the things - created `.createRoute` and separate `.addRoute` which in turns just _adds_ route object created by `.createRoute` to the `.routes` array. And everything just gone more beautiful.

So what the Route Object is. It is plain JavaScript object with few properties such as `path`, `route`, `method`, `match` , `prefix` and `middlewares`. Below I'll review them.

- `method` - HTTP request method of the route, such as `GET`, `POST` and `DELETE`
- `route` - user-defined path, such as `/foo/bar`
- `prefix` - router prefix for the routes, by default it is `/`
- `path` - combines `prefix` and `route`,  such as `/api/foo` if prefix is `/api` and route is `/foo`
- `match` - function which checks if `route` path match the incoming `ctx.path`
- `middlewares` - given middleware functions for that route, where each function can be both old and modern koa middleware.

#### Example 1

```js
let router = require('koa-better-router')()

let foobar = router.createRoute('GET', '/foo/bar', function * (next) {
  this.body = 'Hello Foo Bar!'
  yield next
})

console.log(foobar)
console.log(foobar.prefix) // => '/'
console.log(foobar.path)   // => '/foo/bar'
console.log(foobar.route)  // => '/foo/bar'
console.log(foobar.middlewares.length) // => 1
```

Looking at the example above you will just notice you don't need anything other - you don't need Koa or anything. Will just see the output of route configuration. Where its `.middlewares` property will be array containing only one function currently. Try it with `node recipes/route-objects/example1.js`.

The `.addRoute`/`.createRoute` method are smart enough to convert any old middleware to modern middleware, using [koa-convert](http://ghub.io/koa-convert)'s `.back` method under the hood.

About the `prefix` thing. It is `/` by default, but later it is more useful in [koa-rest-router](http://ghub.io/koa-rest-router) and make more sense. Because you can have one `/api/v1`  prefix, and another for the v2 of your API - `/api/v2`.

#### Example 2

Try out what you will get when you pass `prefix: '/api'` to the above example.

```js
let router = require('koa-better-router')({
  prefix: '/api'
})

let foobar = router.createRoute('GET /foo/bar', (ctx, next) => {}, (ctx, next) => {})

console.log(foobar)
console.log(foobar.prefix) // => '/api'
console.log(foobar.path)   // => '/api/foo/bar'
console.log(foobar.route)  // => '/foo/bar'
console.log(foobar.middlewares.length) // => 2
```

Run it with `node recipes/route-objects/example2.js` and let's continue to the next part of this amazing kind of _"tutorial"_, haha.

## What are the diffs between `.createRoute` and `.addRoute`?

Let's clarify that a bit. In some cases, you just want route object, modify it a bit and later add it as actual route to your router. If you look at the source code of `.addRoute` you will just see 2 lines of code - one for calling the `.createRoute` and another which is just `this.routes.push(routeObject)`. Any checks and meaningful code is in `.createRoute`, because it make sense.

So in most cases you will just use `.addRoute` and don't mind. Or you can just `.loadMethods` and you will have methods in the `router` instance for each item in the [methods](http://ghub.io/methods) library - so `.get`, `.post`, `.del` and `.delete`, `.put`, `.merge` and etc. It is just a matter of own preferences.

## What about `.addRoutes` and `.addRoute`?

While `.addRoute` just adds single route to your router, `.addRoutes` adds multiple routes. It accepts that previously described _Route Objects_ which you can get from `.createRoute` or `.getRoute`, or even can just pass `router.routes`/`router.getRoutes()`.

Let's see usage of `.addRoutes` and `.createRoute`/`.getRoute` in second example.

#### Example 3

```js
let router = require('koa-better-router')()
let extend = require('extend-shallow')

router.createRoute('GET /foo', (ctx, next) => {})

let foo = router.getRoute('/foo')
console.log(foo)

let foo22 = extend({}, foo)
console.log(foo22) // same as above

// let's change `foo22` a bit
foo22.route = '/foobar'
let foobar = router.createRoute(foo22.method, foo22.route, foo22.middlewares)
console.log(foobar)

let bar = router.createRoute('GET /bar', (ctx, next) => {})

// output current routes (it is empty now)
console.log(router.routes)

// let's actually add them to the router
router.addRoutes(foo, bar, foobar)

// recheck the `routes` array
console.log(router.routes) // it is not empty now :)
```

So, in the above example you just see couple of things:

1. One is that we created `/foo` route and output it
2. Second is that we **get** that `/foo` route using `.getRoute` method
3. We modified that `/foo` route to have `/foobar` path instead
4. We created new Route Object, based on first route but we changed its path (`route` property)
5. Prints the new `/foobar` route
6. Created new route called `/bar`
7. And finally added all of the routes to the `router.routes` array

It that clear enough? Run it using `node recipes/route-objects/example3.js` to see the results of prints.

## How actually `.getRoute` works?

Actually it is tricky here in `koa-better-router`. It's not that tricky, but it is raw. You basically should pass the full route path, where you can skip the starting `/`, which is not so big deal. But really, there's no other way to do that *getting* of specific route.

If you have big route, such as `/foo/bar/baz/qux` you should pass the same thing to the `.getRoute` method. And we can't create it to be for example just `foo` because what about if you have second route path such as `/foo/beer/sofia`?

I do not using it, but I just wanted to have some possible way of doing this if anyone want it in future for some reason. It is different story in `.getResource` method in the `koa-rest-router` package. There we have resource names and collect the resources in separate cache by their name, by user-defined single plural name. That's why there is more easily to implement _getting_ of resources.

## Middlewares?

You may noticed that previously I mention that the _Route Object_ has `middlewares` property.

So yea, there we have `middlewares` property which always is array. Array of functions that will be called when the `route` is accessed. Each _middleware_ is just what [koa](http://github.com/koajs/koa)'s `.use` method can accept.

Currently in `v1`  you can pass GeneratorFunctions which looks like this

```js
let app = require('koa')() // npm install koa@^1.x

app.use(function * (next) {
  this.body = 'Hello World!'
  yield next
})
```

But in the upcoming `v2` of koa, we can just use plain old normal function and return a `Promise`. Actually we should call `next` which returns a promise. But if you want to error you can just return rejected promise.

So let's show you what `v2` middleware looks like

```js
let Koa = require('koa') // npm install koa@^2
let app = new Koa() // weird requirement of v2

app.use(function (ctx, next) {
  ctx.body = `This is Koa@2 middleware!`
  return next()
})
```

In some of the routers out there, you can assign multiple middlewares to one route and it perfectly make sense in some cases. For example, route pointing to the Admin panel area - you need an authorization, right? That's a perfect use case. Another one can be form body parsing.

Let's see how we can create one route for html form, and one for the incoming POST data.

1. We'll use [koa-better-body](http://ghub.io/koa-better-body) for body parsing
2. Great [bel](http://ghub.io/bel) library for creating the form
3. Both _old_ and _modern_ middlewares for [koa](http://github.com/koajs/koa)

**form.js**

```js
let bel = require('bel')

module.exports = function form (ctx, state) {
  let html = bel`<div><h1>Hello ${state.place}</h1>
  <h2>Path is ${ctx.route.path}</h2>
  <form action="/comment" method="POST">
    <input type="text" name="author">
    <input type="text" name="comment">
    <button type="submit">Send</button>
  </form></div>
  `
  return html.toString()
}
```

Let's create our server and router part now.

#### Example 4

Run it using `node recipes/route-objects/example4.js` from the project root.

```js
let fooRouter = require('koa-better-router')()
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
```

It is just crazy and amazing!