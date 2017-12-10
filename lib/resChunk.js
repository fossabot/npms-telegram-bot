module.exports = (res, cb) => {
  let queryData = ''
  res.on('data', (chunk) => {
    queryData += chunk
  })
  res.on('end', () => {
    if (res.statusCode === 200) {
      cb(null, queryData)
    } else {
      cb(new Error(`bad statusCode: ${res.statusCode}`), queryData)
    }
  })
  res.on('error', (err) => {
    cb(err, queryData)
  })
}
