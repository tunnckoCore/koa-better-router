# [koa-better-router][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Fast, simple, smart and correct routing for [koa][], using [path-match][]. Foundation for building powerful, flexible and RESTful APIs easily.

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

You may also be interested in [koa-rest-router][]. It uses this router for creating
powerful, flexible and RESTful APIs for enterprise easily!

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  * [KoaBetterRouter](#koabetterrouter)
  * [.loadMethods](#loadmethods)
  * [.createRoute](#createroute)
  * [.addRoute](#addroute)
  * [.getRoute](#getroute)
  * [.groupRoutes](#grouproutes)
  * [.middleware](#middleware)
  * [.legacyMiddleware](#legacymiddleware)
- [Related](#related)
- [Contributing](#contributing)

## Install

```
npm i koa-better-router --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
let router = require('koa-better-router')().loadMethods()

// or

let Router = require('koa-better-router')
let router = Router() // or new Router(), no matter
```

## API

### [KoaBetterRouter](index.js#L49)
> Initialize `KoaBetterRouter` with optional `options` which are directtly passed to `path-match` and in addition we have two more `legacy` and `prefix`.

**Params**

* `[options]` **{Object}**: options passed to [path-match][] directly    

**Example**

```js
let router = require('koa-better-router')
let api = router({ prefix: '/api' }).loadMethods()

api.get('/', (ctx, next) => {
  ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
  return next()
})

// can use generator middlewares
api.get('/foobar', function * (next) {
  this.body = `Foo Bar Baz! ${ctx.route.prefix}`
  yield next
})

let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(api.middleware())
app.use(api.middleware({ prefix: '/' }))

app.listen(4444, () => {
  console.log('Try out /, /foobar, /api/foobar and /api')
})
```

### [.loadMethods](index.js#L92)
> Load the HTTP verbs as methods on instance. If you not "load" them you can just use `.addRoute` method. If you "load" them, you will have method for each item on [methods][] array - such as `.get`, `.post`, `.put` etc.

* `returns` **{KoaBetterRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-better-router')()

// all are `undefined` if you
// don't `.loadMethods` them
console.log(router.get)
console.log(router.post)
console.log(router.put)
console.log(router.del)
console.log(router.addRoute) // => function
console.log(router.middleware) // => function
console.log(router.legacyMiddleware) // => function

router.loadMethods()

console.log(router.get)  // => function
console.log(router.post) // => function
console.log(router.put)  // => function
console.log(router.del)  // => function
```

### [.createRoute](index.js#L143)
> Just creates route object without adding it to `this.routes` array.

**Params**

* `<method>` **{String}**: http verb or `'GET /users'`    
* `[route]` **{String|Function}**: for what `ctx.path` handler to be called    
* `...fns` **{Function}**: can be array or single function, any number of arguments after `route` can be given too    
* `returns` **{Object}**: plain `route` object with useful properties  

**Example**

```js
let router = require('koa-better-router')({ prefix: '/api' })
let route = router.createRoute('GET', '/users', [
  function (ctx, next) {},
  function (ctx, next) {},
  function (ctx, next) {},
])

console.log(route)
// => {
//   prefix: '/api',
//   route: '/users',
//   pathname: '/users',
//   path: '/api/users',
//   match: matcher function against `route.path`
//   method: 'GET',
//   middlewares: array of middlewares for this route
// }

console.log(route.match('/foobar'))    // => false
console.log(route.match('/users'))     // => false
console.log(route.match('/api/users')) // => true
console.log(route.middlewares.length)  // => 3
```

### [.addRoute](index.js#L240)
> Powerful method to add `route` if you don't want to populate you router instance with dozens of methods. The `method` can be just HTTP verb or `method` plus `route` something like `'GET /users'`. Both modern and generators middlewares can be given too, and can be combined too. **Adds routes to `this.routes` array**.

**Params**

* `<method>` **{String}**: http verb or `'GET /users'`    
* `[route]` **{String|Function}**: for what `ctx.path` handler to be called    
* `...fns` **{Function}**: can be array or single function, any number of arguments after `route` can be given too    
* `returns` **{KoaBetterRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-better-router')()

// any number of middlewares can be given
// both modern and generator middlewares will work
router.addRoute('GET /users',
  (ctx, next) => {
    ctx.body = `first ${ctx.route.path};`
    return next()
  },
  function * (next) {
    this.body = `${this.body} prefix is ${this.route.prefix};`
    yield next
  },
  (ctx, next) => {
    ctx.body = `${ctx.body} and third middleware!`
    return next()
  }
)

// You can middlewares as array too
router.addRoute('GET', '/users/:user', [
  (ctx, next) => {
    ctx.body = `GET /users/${ctx.params.user}`
    console.log(ctx.route)
    return next()
  },
  function * (next) {
    this.body = `${this.body}, prefix is: ${this.route.prefix}`
    yield next
  }
])

// can use `koa@1` and `koa@2`, both works
let Koa = require('koa')
let app = new Koa()

app.use(router.middleware())
app.listen(4290, () => {
  console.log('Koa server start listening on port 4290')
})
```

### [.getRoute](index.js#L270)
> Get a route by `name`. Name of each route is its pathname or route. For example: the `name` of `.get('/cat/foo')` route is `/cat/foo`, but if you pass `cat/foo` - it will work too.

**Params**

* `name` **{String}**: name of the Route Object    
* `returns` **{Object}**: Route Object  

**Example**

```js
let router = require('koa-better-router')().loadMethods()

router.get('/cat/foo', function (ctx, next) {})
router.get('/baz', function (ctx, next) {})

console.log(router.getRoute('baz'))      // => Route Object
console.log(router.getRoute('cat/foo'))  // => Route Object
console.log(router.getRoute('/cat/foo')) // => Route Object
```

### [.groupRoutes](index.js#L337)
> Groups multiple _"Route Objects"_ into one which middlewares will be these middlewares from the last "source". So let say you have `dest` route with 2 middlewares appended to it and the `src1` route has 3 middlewares, the final (returned) route object will have these 3 middlewares from `src1` not the middlewares from `dest`. Make sense? If not this not make sense for you, please open an issue here, so we can discuss and change it (then will change it in the [koa-rest-router][] too, because there the things with method `.groupResource` are the same).

**Params**

* `dest` **{Object}**: known as _"Route Object"_    
* `src1` **{Object}**: second _"Route Object"_    
* `src2` **{Object}**: third _"Route Object"_    
* `returns` **{Object}**: totally new _"Route Object"_ using `.createRotue` under the hood  

**Example**

```js
let router = require('./index')({ prefix: '/api/v3' })

let foo = router.createRoute('GET /foo/qux/xyz', function (ctx, next) {})
let bar = router.createRoute('GET /bar', function (ctx, next) {})

let baz = router.groupRoutes(foo, bar)
console.log(baz)
// => Route Object {
//   prefix: '/api/v3',
//   path: '/api/v3/foo/qux/sas/bar',
//   pathname: '/foo/qux/sas/bar'
//   ...
// }

// Server part
let Koa = require('koa')
let app = new Koa()

router.routes = router.routes.concat(baz)
app.use(router.middleware())
app.listen(2222, () => {
  console.log('Server listening on http://localhost:2222')

  router.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:2222${route.path}`)
  })
})
```

### [.middleware](index.js#L405)
> Active all routes that are defined. You can pass `opts` to pass different `prefix` for your routes. So you can have multiple prefixes with multiple routes using just one single router. You can also use multiple router instances. Pass `legacy: true` to `opts` and you will get generator function that can be used in Koa v1.

**Params**

* `[opts]` **{Object|Boolean}**: optional, safely merged with options from constructor, if you pass boolean true, it understands it as `opts.legacy`    
* `returns` **{GeneratorFunction|Function}**: by default modern [koa][] middleware function, but if you pass `opts.legacy: true` it will return generator function  

**Example**

```js
let Router = require('koa-better-router')
let api = new Router({ prefix: '/api' })
let router = Router({ legacy: true })

router.loadMethods().get('GET /',
  (ctx, next) => {
    ctx.body = 'Hello world!'
    return next()
  },
  (ctx, next) => {
    ctx.body = `${ctx.body} Try out /api/users and /foo/users`
    return next()
  })

api.loadMethods()
api.get('/users', function * (next) {
  this.body = `Prefix: ${this.route.prefix}, path: ${this.route.pathname}`
  yield next
})

let app = require('koa')() // koa v1

// no need to pass `legacy`, because of the constructor options
app.use(router.middleware())

// initialize `api` router with `legacy true`,
// because we don't have legacy defined in api router constructor
app.use(api.middleware(true))
app.use(api.middleware({ legacy: true, prefix: '/foo' }))

app.listen(4321, () => {
  console.log('Legacy Koa v1 server is started on port 4321')
})
```

### [.legacyMiddleware](index.js#L485)
> Converts the modern middleware routes to generator functions using [koa-convert][].back under the hood. It is sugar for the `.middleware(true)` or `.middleware({ legacy: true })`

* `returns` **{Function|GeneratorFunction}**  

**Example**

```js
let app = require('koa') // koa v1.x
let router = require('koa-better-router')()

router.addRoute('GET', '/users', function * (next) {
  this.body = 'Legacy KOA!'
  yield next
})

app.use(router.legacyMiddleware())
app.listen(3333, () => {
  console.log('Open http://localhost:3333/users')
})
```

## Related
- [koa-bel](https://www.npmjs.com/package/koa-bel): View engine for `koa` without any deps, built to be used with… [more](https://github.com/tunnckocore/koa-bel#readme) | [homepage](https://github.com/tunnckocore/koa-bel#readme "View engine for `koa` without any deps, built to be used with `bel`. Any other engines that can be written in `.js` files would work, too.")
- [koa-better-body](https://www.npmjs.com/package/koa-better-body): Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json… [more](https://github.com/tunnckocore/koa-better-body#readme) | [homepage](https://github.com/tunnckocore/koa-better-body#readme "Full-featured [koa][] body parser! Support parsing text, buffer, json, json patch, json api, csp-report, multipart, form and urlencoded bodies. Works for koa@1, koa@2 and will work for koa@3.")
- [koa-better-ratelimit](https://www.npmjs.com/package/koa-better-ratelimit): Better, smaller, faster - koa middleware for limit request by ip, store… [more](https://github.com/tunnckoCore/koa-better-ratelimit) | [homepage](https://github.com/tunnckoCore/koa-better-ratelimit "Better, smaller, faster - koa middleware for limit request by ip, store in-memory.")
- [koa-better-serve](https://www.npmjs.com/package/koa-better-serve): Small, simple and correct serving of files, using [koa-send][] - nothing more. | [homepage](https://github.com/tunnckocore/koa-better-serve#readme "Small, simple and correct serving of files, using [koa-send][] - nothing more.")
- [koa-ip-filter](https://www.npmjs.com/package/koa-ip-filter): Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or… [more](https://github.com/tunnckocore/koa-ip-filter#readme) | [homepage](https://github.com/tunnckocore/koa-ip-filter#readme "Middleware for [koa][] that filters IPs against glob patterns, RegExp, string or array of globs. Support custom `403 Forbidden` message and custom ID.")
- [koa-rest-router](https://www.npmjs.com/package/koa-rest-router): Building powerful, flexible and RESTful APIs for enterprise easily. | [homepage](https://github.com/tunnckocore/koa-rest-router#readme "Building powerful, flexible and RESTful APIs for enterprise easily.")
- [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch… [more](https://github.com/jonschlinkert/nanomatch) | [homepage](https://github.com/jonschlinkert/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/koa-better-router/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[koa-convert]: https://github.com/gyson/koa-convert
[koa-send]: https://github.com/koajs/send
[koa]: https://github.com/koajs/koa
[methods]: https://github.com/jshttp/methods
[micromatch]: https://github.com/jonschlinkert/micromatch
[path-match]: https://github.com/pillarjs/path-match
[through2]: https://github.com/rvagg/through2
[use]: https://github.com/jonschlinkert/use
[vinyl]: https://github.com/gulpjs/vinyl

[npmjs-url]: https://www.npmjs.com/package/koa-better-router
[npmjs-img]: https://img.shields.io/npm/v/koa-better-router.svg?label=koa-better-router

[license-url]: https://github.com/tunnckoCore/koa-better-router/blob/master/LICENSE
[license-img]: https://img.shields.io/npm/l/koa-better-router.svg

[downloads-url]: https://www.npmjs.com/package/koa-better-router
[downloads-img]: https://img.shields.io/npm/dm/koa-better-router.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/koa-better-router
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/koa-better-router.svg

[travis-url]: https://travis-ci.org/tunnckoCore/koa-better-router
[travis-img]: https://img.shields.io/travis/tunnckoCore/koa-better-router/master.svg

[coveralls-url]: https://coveralls.io/r/tunnckoCore/koa-better-router
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/koa-better-router.svg

[david-url]: https://david-dm.org/tunnckoCore/koa-better-router
[david-img]: https://img.shields.io/david/tunnckoCore/koa-better-router.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/ama
[new-message-img]: https://img.shields.io/badge/ask%20me-anything-green.svg

[koa-rest-router]: https://github.com/tunnckocore/koa-rest-router