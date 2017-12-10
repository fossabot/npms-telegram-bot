const http = require('http')
const querystring = require('querystring')

const resChunk = require('./resChunk')
const resCb = require('./resCb')

const query = (query, callback = resCb) => {
  const escape = querystring.escape(query)
  const options = {
    method: 'POST',
    path: `/?query=${escape}`,
    host: 'localhost',
    port: 8123
  }
  return http.request(options, res => { resChunk(res, callback) })
}

module.exports = query
