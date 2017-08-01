
const https = require('https')

const error = require('./error')
const res_cb = require(`./res_cb`)
const getURL = require('./getURL')


const get = (server, method, options = {}, cb = res_cb) => {
  const url = getURL(server, method, options)
  console.log(url)
  return https.get(url, cb).on('error', error)
}

const request = (host, path, method, options = {}, cb = res_cb) => {
  const https_options = {
    hostname: host,
    port: 443,
    path: getURL(path, method, options),
    method: 'GET',
    secureProtocol: 'TLSv1_2_client_method'
  }
  console.log(https_options)
  https.request(https_options, cb).on('error', error).end()
}

module.exports = {get, request}