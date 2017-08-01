
const https = require('https')
const fs = require('fs')
const promisify = require('util').promisify
const is_json = require('is-json')

const config = require('./config')
const request = promisify(https.request)

const https_options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
}

const telegram = require('./lib/telegram')
const handle = require('./lib/handle')
const res_chunk = require('./lib/res_chunk')
const error = require('./lib/error')

Promise.all([
    new Promise((re, rej) => {
      telegram.webhook((res) => {
        if (res.statusCode == 200)
          res_chunk(res, (err, data) => {
            if (err) rej(err)
            else {
              if (is_json(data)) {
                const jsdata = JSON.parse(data)
                if (jsdata.ok)
                  re(jsdata)
                else
                  rej('not ok', data)
              } else {
                rej('not json', data)
              }
            }
          })
        else 
          rej('bad status code: ', res.statusCode)
      })
    }),
    new Promise((res, rej) => {
      try {
        res(https.createServer(https_options, handle).listen(config.port))
      } catch (err) {
        rej(err)
      }
    })
  ]
).then((arr) => {
  console.log('npmsbot is up')
}).catch(error)