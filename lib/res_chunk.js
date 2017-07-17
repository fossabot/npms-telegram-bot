module.exports = (res, cb) => {
  let queryData = ''
  res.on('data', (chunk) => {
    queryData += chunk
  })
  res.on('end', () => {
    cb(null, queryData)
  })
  res.on('error', (err) => {
    cb(err, queryData)
  })
}