'use strict'

var bel = require('bel')

module.exports = function result (ctx) {
  let html = bel`<div><h2>Route is ${ctx.route.path}</h2>
  <form action="/form" method="POST">
    <input type="text" name="foo">
    <input type="text" name="bar">
    <button type="submit">Send</button>
  </form></div>`
  return html.toString()
}
