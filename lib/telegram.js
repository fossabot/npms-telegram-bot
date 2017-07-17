const https = require('https')
const qs = require('querystring')
const config = require('./../config')
const error = require('./error')
const res_cb = require(`./res_cb`)

const get = (method, options = {}, cb = () => {}) => {
  const tg_url = `https://api.telegram.org/bot`
  const url = `${tg_url}${config.token}/${method}?${qs.stringify(opts)}`
  return https.get(url, cb).on('error', error)
}

const webhook = () => 
  get('setWebhook', {
    url: `${config.webhook_url}/${config.webhook_secret}`
  })

const reqWebhook = (res, options = {}) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(options))
}


const telegram = {get, reqWebhook}

module.exports = telegram