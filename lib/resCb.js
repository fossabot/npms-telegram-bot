const error = require('./error')

module.exports = (res, cb = error) => {
  if (!res || res.statusCode !== 200) {
    cb(res)
  }
}
