
const https = require('https')
const socks = require('socksv5')

const config = require('../config')
const error = require('./error')
const resCb = require(`./resCb`)
const getURL = require('./getURL')

const socksConfig = {
  proxyHost: 'example.ru',
  proxyPort: 1080,
  auths: [ socks.auth.UserPassword('example', 'example') ]
}

const get = (server, method, options = {}, cb = resCb) => {
  const url = getURL(server, method, options)
  console.log(url)
  return https.get(url, cb).on('error', error)
}

const request = (host, path, method, options = {}, cb = resCb) => {
  const httpsOptions = {
    hostname: host,
    port: 443,
    path: getURL(path, method, options),
    method: 'GET'
  }
  if (config.socks5) {
    httpsOptions.agent = new socks.HttpsAgent(socksConfig)
  }
  https.request(httpsOptions, cb).on('error', error).end()
}

module.exports = {get, request}
