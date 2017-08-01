
const qs = require('querystring')

const getURL = (server, method, options) => 
  `${server}/${method}?${qs.stringify(options)}`

module.exports = getURL