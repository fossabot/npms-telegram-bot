
const https = require('https')

const config = require('./../config')
const error = require('./error')
const res_cb = require(`./res_cb`)
const rnd_str = require('./rnd_str')
const libGet = require('./get').get
const libRequest = require('./get').request

const get = (method, options = {}, cb = res_cb) =>
  libGet(config.npmsURL, method, options, cb)

const request = (method, options = {}, cb = res_cb) =>
  libRequest('api.npms.io', '/v2', method, options, cb)

const npmsio = {get, request}

module.exports = npmsio