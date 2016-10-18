'use strict'

let Router = require('../../index')
let api = new Router() // or just without `new`, it is smart enough

console.log(typeof api.get) // => undefined
console.log(typeof api.put) // => undefined
console.log(typeof api.post) // => undefined

api.loadMethods()

console.log(typeof api.get) // => function
console.log(typeof api.put) // => function
console.log(typeof api.post) // => function
