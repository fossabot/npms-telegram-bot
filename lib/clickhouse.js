const
  http = require('http'),
  qs = require('querystring')

const res_chunk = require(`${__dirname}/res_chunk`)

const query = (query, cb = res_cb) => {
  const options = {
    method: 'POST',
    path: '/?query='+qs.escape(query),
    host: 'localhost',
    port: 8123
  }
  return http.request(options, res => res_chunk(res, cb))
}

module.exports = query
