
const https = require('https')
const fs = require('fs')

const config = require('./../config')
const error = require('./error')
const res_cb = require(`./res_cb`)
const rnd_str = require('./rnd_str')
const libGet = require('./get').get

const get = (method, options = {}, cb = res_cb) =>
  libGet(`${config.tgURL}${config.token}`, method, options, cb)

const webhook = (cb) => {
  const key = rnd_str(32)
  console.log(`${config.webhook_url}/${key}`)
  get('setWebhook', {
    url: `${config.webhook_url}/${key}`,
    max_connections: 100
  }, cb)
  config.webhook_secret = key
}

const reqWebhook = (res, options = {}) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(options))
}


const telegram = {get, reqWebhook, webhook}

module.exports = telegram