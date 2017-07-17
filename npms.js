const https = require('https')
const fs = require('fs')
const promisify = require('util').promisify

const config = require('./config')
const request = promisify(https.request)
const https_options = {
  key: fs.readFileSync('key.key'),
  cert: fs.readFileSync('crt.crt')
}

const telegram = require('./lib/telegram')
const handle = require('./lib/handle')

telegram.webhook()
https.createServer(https_options, handle).listen(8443)