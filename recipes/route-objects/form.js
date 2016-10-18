'use strict'

let bel = require('bel')

module.exports = function form (ctx, state) {
  let html = bel`<div><h1>Hello ${state.place}</h1>
  <h2>Path is ${ctx.route.path}</h2>
  <form action="/comment" method="post">
    <input type="text" name="author">
    <input type="text" name="comment">
    <button type="submit">Send</button>
  </form></div>
  `
  return html.toString()
}
