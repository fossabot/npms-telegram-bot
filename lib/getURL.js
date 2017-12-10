
const qs = require('querystring')

const getURL = (server, method, options) => {
  return `${server}/${method}?${qs.stringify(options)}`
}

module.exports = getURL
