const
  http = require('http'),
  qs = require('querystring')

const resChunk = require(`${__dirname}/resChunk`)

const query = (query, cb = res_cb) => {
  const options = {
    method: 'POST',
    path: '/?query='+qs.escape(query),
    host: 'localhost',
    port: 8123
  }
  return http.request(options, res => resChunk(res, cb))
}

module.exports = query
