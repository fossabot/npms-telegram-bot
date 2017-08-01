module.exports = (res) => {
  console.log(res.statusCode)
  let queryData = ''
  res.on('data', (chunk) => {
    queryData += chunk
  })
  res.on('end', () => {
    console.log(queryData)
  })
}