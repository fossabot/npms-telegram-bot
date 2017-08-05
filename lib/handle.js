
const isJson = require('is-json')
const moment = require('moment')

const hit = require(`${__dirname}/hit`)
const telegram = require(`${__dirname}/telegram`)
const npmsio = require(`${__dirname}/npmsio`)
const resChunk = require(`${__dirname}/resChunk`)
const deepLog = require(`${__dirname}/deepLog`)
const config = require(`${__dirname}/../config`)
const error = require(`${__dirname}/error`)

const info = {}

const handle = (req, res) => {
  console.log(req.url, req.url === `/${config.webhook_secret}`)
  if (req.url === `/${config.webhook_secret}` && req.method === 'POST') {
    let s = ''
    req.on('data', c => s += c)
    req.on('end', () => {
      if (isJson(s)) {
        const j = JSON.parse(s)
        if (j.message && j.message.chat && j.message.chat.type === 'private') {
          //hit(s.message.chat.id, s.message.chat.type)
          if (j.message.text.startsWith('/start') || j.message.text.startsWith('/about'))
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: config.about_text
            })
          else if (j.message.text.startsWith('/doc') || j.message.text.startsWith('/search'))
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: config.doc_text
            })
          else if (j.message.text.startsWith('/info')) {
            if (!info[j.message.chat.id] || info[j.message.chat.id] < j.message.message_id) {
              info[j.message.chat.id] = j.message.message_id
              telegram.reqWebhook(res, {
                method: 'sendMessage',
                chat_id: j.message.chat.id,
                parse_mode: 'markdown',
                text: 'Send me package name, please'
              })
            } else {
              res.writeHead(200)
              res.end('ok')
            }
          } else {
            if (info[j.message.chat.id]) {
              info[j.message.chat.id] = null
              const package = j.message.text.replace(/[^\w\d\s-_:@,\/]+/gi, '').trim()
              npmsio.info(package, (err, data) => {
                const options = {
                  method: 'sendMessage',
                  chat_id: j.message.chat.id,
                  parse_mode: 'markdown',
                  disable_web_page_preview: true,
                  text: 'error'
                }
                if (err) {
                  error(err, data)
                } else {
                  options.text = data
                }
                telegram.reqWebhook(res, options)
              })
            } else {
              const search = j.message.text.replace(/[^\w\d\s-_:@,\/]+/gi, '').trim()
              npmsio.search(search, (err, data) => {
                const options = {
                  method: 'sendMessage',
                  chat_id: j.message.chat.id,
                  parse_mode: 'markdown',
                  disable_web_page_preview: true,
                  text: 'error'
                }
                if (err) {
                  error(err, data)
                } else {
                  options.text = data.text
                  options.reply_markup = data.reply_markup
                }
                telegram.reqWebhook(res, options)
              })
            }
          }
        } else if (j.callback_query) {
          const offset = Number(j.callback_query.data)
          if (offset > -1 && j.callback_query.message) {
            const m = j.callback_query.message.text.match(/results for ([\w\d\s-_:@,\/]+) \n\n/i)
            if (m) {
              const search = m[1]
              npmsio.search(search, 5, offset, (err, data) => {
                if (err) {
                  error(err, data)
                  telegram.reqWebhook(res, {
                    method: answerCallbackQuery,
                    callback_query_id: j.callback_query.id,
                    text: 'ERROR',
                    show_alert: true
                  })
                } else {
                  telegram.get('answerCallbackQuery', {
                    callback_query_id: j.callback_query.id,
                    text: 'Loaded',
                    show_alert: false
                  })
                  telegram.reqWebhook(res, {
                    method: 'editMessageText',
                    chat_id: j.callback_query.message.chat.id,
                    message_id: j.callback_query.message.message_id,
                    parse_mode: 'markdown',
                    disable_web_page_preview: true,
                    text: data.text,
                    reply_markup: data.reply_markup
                  })
                }
              })
            }
          }
        } else if (j.inline_query) {
          // inline mode

          deepLog(j.callback_query)
          
        } else {
          res.writeHead(404)
          res.end('404 not found')
          error('handle / no message')
        }
      } else {
        res.writeHead(404)
        res.end('404 not found')
        error('handle / no json')
      }
      // clusters
      // clickhouse hit
      // inline mode
      // group announce
      // payment donate
      // lint code
      // npms auto test
    })
  } else {
    res.writeHead(301, {'Location': 'https://t.me/npmsbot'})
    res.end()
    error('handle / no post or bad key')
  }
}

module.exports = handle