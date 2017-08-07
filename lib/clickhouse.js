
const http = require('http')
const qs = require('querystring')

const resChunk = require(`${__dirname}/resChunk`)
const resCb = require(`${__dirname}/resCb`)

const query = (query, cb = () => {}) => {
  const options = {
    method: 'POST',
    path: '/?query='+qs.escape(query),
    host: 'localhost',
    port: 8123
  }
  return http.request(options, res => resChunk(res, cb))
}

module.exports = query
