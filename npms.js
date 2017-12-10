
const https = require('https')
const fs = require('fs')
const isJson = require('is-json')

const config = require('./config')

const httpsOptions = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
}

const telegram = require('./lib/telegram')
const handle = require('./lib/handle')
const resChunk = require('./lib/resChunk')
const error = require('./lib/error')
const green = require('./lib/green')

const webhookCallback = (res) => {
  if (res.statusCode === 200) {
    resChunk(res, (err, data) => {
      if (err) error(err)
      else {
        if (isJson(data)) {
          const jsdata = JSON.parse(data)
          if (jsdata.ok) {
            green('webhook is set')
          } else {
            error('webhook / not ok', data)
          }
        } else {
          error('webhook / not json', data)
        }
      }
    })
  } else {
    error(`webhook / bad status code: ${res.statusCode}`)
    if (res.statusCode === 429) {
      setTimeout(() => telegram.webhook(webhookCallback), 1000)
    }
  }
}

telegram.webhook(webhookCallback)

https.createServer(httpsOptions, handle).listen(config.port, err => {
  if (err) error(error)
  else green('server is up')
})
