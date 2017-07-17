const error = require(`${__dirname}/error`)

module.exports = (res, cb = error) => {
  if (!res || res.statusCode != 200)
    error(res)
}
