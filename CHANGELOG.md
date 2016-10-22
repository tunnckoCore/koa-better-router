# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.1"></a>
## [2.0.1](https://github.com/tunnckocore/koa-better-router/compare/v2.0.0...v2.0.1) (2016-10-22)


### Bug Fixes

* **deps/tests:** add missing `koa-compose[@3](https://github.com/3)` dep; add tests for koa[@1](https://github.com/1) ([2508e5e](https://github.com/tunnckocore/koa-better-router/commit/2508e5e)), closes [tunnckoCore/koa-rest-router#10](https://github.com/tunnckoCore/koa-rest-router/issues/10)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/tunnckocore/koa-better-router/compare/v1.2.0...v2.0.0) (2016-10-22)


### Code Refactoring

* **.middleware:** remove passing arguments to `.middleware` method ([0b14fda](https://github.com/tunnckocore/koa-better-router/commit/0b14fda)), closes [#9](https://github.com/tunnckocore/koa-better-router/issues/9)
* **RouteObject:** remove `pathname` property, `route` make more sense ([6f9d90b](https://github.com/tunnckocore/koa-better-router/commit/6f9d90b))


### BREAKING CHANGES

* RouteObject: remove `routeObject.pathname`, use `routeObject.route` for just the route or

`routeObject.path` for the combination of `routeObject.prefix` plus `routeObject.route`. For example

route `/foo/bar` with prefix `/api` - `.route` is `/foo/bar` and `.path` is `/api/foo/bar`. Both

`pathname` and `route` were the same.
* .middleware: `.middleware` method no more accepts arguments - use `.legacyMiddleware` for

legacy; create a new router for another prefix then use `.extend` method for grouping the router.



<a name="1.2.0"></a>
# [1.2.0](https://github.com/tunnckocore/koa-better-router/compare/v1.1.0...v1.2.0) (2016-10-19)


### Bug Fixes

* **groupRoutes:** simplify `.groupRoutes` method ([04a88d7](https://github.com/tunnckocore/koa-better-router/commit/04a88d7))


### Features

* **addRoutes:** add `.addRoutes` method, part of #5 ([f3a8757](https://github.com/tunnckocore/koa-better-router/commit/f3a8757))
* **extend:** add `.extend` method, part of #5 and #6 ([ba30fdd](https://github.com/tunnckocore/koa-better-router/commit/ba30fdd)), closes [#6](https://github.com/tunnckocore/koa-better-router/issues/6)
* **getRoute:** add `.getRoute` method, part of #5 ([9996eee](https://github.com/tunnckocore/koa-better-router/commit/9996eee))
* **getRoutes:** add `.getRoutes` method, part of #5 ([a171a43](https://github.com/tunnckocore/koa-better-router/commit/a171a43))
* **groupRoutes:** add `.groupRoutes` method, part of #5 ([4126827](https://github.com/tunnckocore/koa-better-router/commit/4126827)), closes [#3](https://github.com/tunnckocore/koa-better-router/issues/3)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/tunnckocore/koa-better-router/compare/v1.0.2...v1.1.0) (2016-10-14)


### Features

* **createRoute:** add `.createRoute` method ([0135211](https://github.com/tunnckocore/koa-better-router/commit/0135211)), closes [#2](https://github.com/tunnckocore/koa-better-router/issues/2)



<a name="1.0.2"></a>
## [1.0.2](https://github.com/tunnckocore/koa-better-router/compare/v1.0.1...v1.0.2) (2016-10-14)


### Bug Fixes

* **codeclimate:** fix "duplicate" issue from codeclimate (shits et al) ([83257bd](https://github.com/tunnckocore/koa-better-router/commit/83257bd))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/tunnckocore/koa-better-router/compare/v1.0.0...v1.0.1) (2016-10-14)


### Bug Fixes

* **REST:** respect routes order in REST APIs ([a6e2102](https://github.com/tunnckocore/koa-better-router/commit/a6e2102))





## 1.0.0 - 2016-10-14
- Release v1.0.0 - it is now stable!
- start follow SemVer correctly from now
- add tests
- fix couple of issues with multiple routers
- fix issues with multiple prefixes with one rotuer
- add API docs
- update keywords
- update related libs

## 0.0.0 - 2016-10-12
- Inital commit