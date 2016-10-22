# [koa-better-router][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Stable and lovely router for [koa][], using [path-match][]. Foundation for building powerful, flexible and RESTful APIs easily.

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

You may also be interested in [koa-rest-router][]. It uses this router for creating
powerful, flexible and RESTful APIs for enterprise easily!

## Highlights
- **production:** ready for and used in
- **foundation:** very simple core for building more powerful routers such as [koa-rest-router][]
- **composability:** group multiple routes and multiple routers - see [.groupRoutes](#grouproutes) and [.addRoutes](#addroutes)
- **flexibility:** multiple prefixes on same router
- **compatibility:** accepts both old and modern middlewares without deprecation messages
- **powerful:** multiple routers on same [koa][] app - even can combine multiple routers
- **light:** not poluting your router instance and app - see [.loadMethods](#loadmethods)
- **smart:** does only what you say it to do
- **small:** very small on dependencies - curated and only most needed
- **backward compatible:** works on koa v1 - use [.legacyMiddleware](#legacymiddleware)
- **maintainability:** very small, beautiful, maintainable and commented codebase
- **stability:** strict semantic versioning and very well documented
- **tested:** very well tested with 100% coverage
- **lovely:** ~500 downloads for the first 2 days
- **open:** love PRs for features, issues and recipes - [Contribute a recipe?](#contributing-recipes)

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
  * [KoaBetterRouter](#koabetterrouter)
  * [.loadMethods](#loadmethods)
  * [.createRoute](#createroute)
  * [.addRoute](#addroute)
  * [.getRoute](#getroute)
  * [.addRoutes](#addroutes)
  * [.getRoutes](#getroutes)
  * [.groupRoutes](#grouproutes)
  * [.extend](#extend)
  * [.middleware](#middleware)
  * [.legacyMiddleware](#legacymiddleware)
- [Related](#related)
- [Contributing](#contributing)
  * [Contributing Recipes](#contributing-recipes)

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

### [KoaBetterRouter](index.js#L55)
> Initialize `KoaBetterRouter` with optional `options` which are directly passed to [path-match][] and in addition we have one more - `prefix`.

**Params**

* `[options]` **{Object}**: options passed to [path-match][] directly    

**Example**

```js
let Router = require('koa-better-router')
let router = Router().loadMethods()

router.get('/', (ctx, next) => {
  ctx.body = `Hello world! Prefix: ${ctx.route.prefix}`
  return next()
})

// can use generator middlewares
router.get('/foobar', function * (next) {
  this.body = `Foo Bar Baz! ${this.route.prefix}`
  yield next
})

let api = Router({ prefix: '/api' })

// add `router`'s routes to api router
api.extend(router)

// The server
let Koa = require('koa') // Koa v2
let app = new Koa()

app.use(router.middleware())
app.use(api.middleware())

app.listen(4444, () => {
  console.log('Try out /, /foobar, /api/foobar and /api')
})
```

### [.loadMethods](index.js#L101)
> Load the HTTP verbs as methods on instance. If you not "load" them you can just use [.addRoute](#addroute) method. If you "load" them, you will have method for each item on [methods][] array - such as `.get`, `.post`, `.put` etc.

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
console.log(router.addRoute) // => function
console.log(router.middleware) // => function
console.log(router.legacyMiddleware) // => function
```

### [.createRoute](index.js#L153)
> Just creates _"Route Object"_ without adding it to `this.routes` array, used by [.addRoute](#addroute) method.

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

### [.addRoute](index.js#L248)
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

### [.getRoute](index.js#L278)
> Get a route by `name`. Name of each route is its pathname or route. For example: the `name` of `.get('/cat/foo')` route is `/cat/foo`, but if you pass `cat/foo` - it will work too.

**Params**

* `name` **{String}**: name of the Route Object    
* `returns` **{Object|Null}**: Route Object, or `null` if not found  

**Example**

```js
let router = require('koa-better-router')().loadMethods()

router.get('/cat/foo', function (ctx, next) {})
router.get('/baz', function (ctx, next) {})

console.log(router.getRoute('baz'))      // => Route Object
console.log(router.getRoute('cat/foo'))  // => Route Object
console.log(router.getRoute('/cat/foo')) // => Route Object
```

### [.addRoutes](index.js#L333)
> Concats any number of arguments (arrays of route objects) to the `this.routes` array. Think for it like registering routes. Can be used in combination with [.createRoute](#createroute) and [.getRoute](#getroute).

**Params**

* `...args` **{Array}**: any number of arguments (arrays of route objects)    
* `returns` **{KoaBetterRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-better-router')()

// returns Route Object
let foo = router.createRoute('GET', '/foo', function (ctx, next) {
  ctx.body = 'foobar'
  return next()
})
console.log(foo)

let baz = router.createRoute('GET', '/baz/qux', function (ctx, next) {
  ctx.body = 'baz qux'
  return next()
})
console.log(baz)

// Empty array because we just
// created them, didn't include them
// as actual routes
console.log(router.routes.length) // 0

// register them as routes
router.addRoutes(foo, baz)

console.log(router.routes.length) // 2
```

### [.getRoutes](index.js#L363)
> Simple method that just returns `this.routes`, which is array of route objects.

* `returns` **{Array}**: array of route objects  

**Example**

```js
let router = require('koa-better-router')()

router.loadMethods()

console.log(router.routes.length) // 0
console.log(router.getRoutes().length) // 0

router.get('/foo', (ctx, next) => {})
router.get('/bar', (ctx, next) => {})

console.log(router.routes.length) // 2
console.log(router.getRoutes().length) // 2
```

### [.groupRoutes](index.js#L419)
> Groups multiple _"Route Objects"_ into one which middlewares will be these middlewares from the last "source". So let say you have `dest` route with 2 middlewares appended to it and the `src1` route has 3 middlewares, the final (returned) route object will have these 3 middlewares from `src1` not the middlewares from `dest`. Make sense? If not this not make sense for you, please open an issue here, so we can discuss and change it (then will change it in the [koa-rest-router][] too, because there the things with method `.groupResource` are the same).

**Params**

* `dest` **{Object}**: known as _"Route Object"_    
* `src1` **{Object}**: second _"Route Object"_    
* `src2` **{Object}**: third _"Route Object"_    
* `returns` **{Object}**: totally new _"Route Object"_ using [.createRoute](#createroute) under the hood  

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

router.addRoutes(baz)

app.use(router.middleware())
app.listen(2222, () => {
  console.log('Server listening on http://localhost:2222')

  router.getRoutes().forEach((route) => {
    console.log(`${route.method} http://localhost:2222${route.path}`)
  })
})
```

### [.extend](index.js#L460)
> Extends current router with routes from `router`. This `router` should be an instance of KoaBetterRouter too. That is the **correct extending/grouping** of couple of routers.

**Params**

* `<router>` **{Object}**: instance of KoaBetterRouter    
* `returns` **{KoaBetterRouter}** `this`: instance for chaining  

**Example**

```js
let router = require('koa-better-router')()
let api = require('koa-better-router')({
  prefix: '/api/v4'
})

router.addRoute('GET', '/foo/bar', () => {})
router.addRoute('GET', '/api/v4/qux', () => {}) // intentional !
api.addRoute('GET', '/woohoo')

api.extend(router)

api.getRoutes().forEach(route => console.log(route.path))
// => outputs (the last one is expected)
// /api/v4/woohoo
// /api/v4/foo/bar
// /api/v4/api/v4/qux
```

### [.middleware](index.js#L518)
> Active all routes that are defined. You can pass `opts` to pass different `prefix` for your routes. So you can have multiple prefixes with multiple routes using just one single router. You can also use multiple router instances. Pass `legacy: true` to `opts` and you will get generator function that can be used in Koa v1.

* `returns` **{Function}**: modern [koa][] v2 middleware  

**Example**

```js
let Router = require('koa-better-router')
let api = Router({ prefix: '/api' })

api.loadMethods()
  .get('GET /', (ctx, next) => {
    ctx.body = 'Hello world!'
    return next()
  }, (ctx, next) => {
    ctx.body = `${ctx.body} Try out /api/users too`
    return next()
  })

api.get('/users', function * (next) {
  this.body = `Prefix: ${this.route.prefix}, path: ${this.route.path}`
  yield next
})

// Server part
let Koa = require('koa')
let app = new Koa()

// Register the router as Koa middleware
app.use(api.middleware())

app.listen(4321, () => {
  console.log('Modern Koa v2 server is started on port 4321')
})
```

### [.legacyMiddleware](index.js#L578)
> Explicitly use this method when want to use the router on **Koa@1**, otherwise use [.middleware](#middleware) method!

* `returns` **{GeneratorFunction}**: old [koa][] v1 middleware  

**Example**

```js
let app = require('koa')() // koa v1.x
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
- [koa-rest-router](https://www.npmjs.com/package/koa-rest-router): Most powerful, flexible and composable router for building enterprise RESTful APIs easily! | [homepage](https://github.com/tunnckocore/koa-rest-router#readme "Most powerful, flexible and composable router for building enterprise RESTful APIs easily!")
- [nanomatch](https://www.npmjs.com/package/nanomatch): Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch… [more](https://github.com/jonschlinkert/nanomatch) | [homepage](https://github.com/jonschlinkert/nanomatch "Fast, minimal glob matcher for node.js. Similar to micromatch, minimatch and multimatch, but complete Bash 4.3 wildcard support only (no support for exglobs, posix brackets or braces)")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/koa-better-router/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

### Contributing Recipes
Recipes are just different use cases, written in form of README in human language. Showing some "Pro Tips" and tricks, answering common questions and so on. They look like [tests](./test.js), but in more readable and understandable way for humans - mostly for beginners that not reads or understand enough the README or API and tests.

- They are in form of folders in the root [`recipes/`](./recipes) folder: for example `recipes/[short-meaningful-recipe-name]/`.
- In recipe folder should exist `README.md` file
- In recipe folder there may have actual js files, too. And should be working.
- The examples from the recipe README.md should also exist as separate `.js` files.
- Examples in recipe folder also should be working and actual.

It would be great if you follow these steps when you want to _fix, update or create_ a recipes. :sunglasses:

- Title for recipe idea should start with `[recipe]`: for example`[recipe] my awesome recipe`
- Title for new recipe (PR) should also start with `[recipe]`.
- Titles of Pull Requests or Issues for fixing/updating some existing recipes should start with `[recipe-fix]`.

It will help a lot, thanks in advance! :yum:

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