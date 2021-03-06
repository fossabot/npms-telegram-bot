
const isJson = require('is-json')

const hit = require('./hit')
const telegram = require('./telegram')
const npmsio = require('./npmsio')
const config = require('../config')
const error = require('./error')

const info = {}

const handle = (req, res) => {
  console.log(`${req.url} ends with /${config.webhook_secret}`, req.url.endsWith(`/${config.webhook_secret}`))
  if (req.url.endsWith(`/${config.webhook_secret}`) && req.method === 'POST') {
    let s = ''
    req.on('data', c => { s += c })
    req.on('end', () => {
      if (isJson(s)) {
        const j = JSON.parse(s)

        if (j.message && j.message.chat && j.message.chat.type === 'private') {
          hit(j.message.chat.id, 'private message')
          if (j.message.text.startsWith('/start') || j.message.text.startsWith('/about')) {
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: config.about_text
            })
          } else if (j.message.text.startsWith('/doc') || j.message.text.startsWith('/search')) {
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: config.doc_text
            })
          } else if (j.message.text.startsWith('/info')) {
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
              const packageName = j.message.text.replace(/[^\w\d\s-_:@,/]+/gi, '').trim()
              npmsio.info(packageName, (err, data) => {
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
          hit(j.callback_query.from.id, 'callback query')

          const offset = Number(j.callback_query.data)
          if (offset > -1 && j.callback_query.message) {
            const m = j.callback_query.message.text.match(/results for ([\w\d\s-_:@,\/]+) \n\n/i)
            if (m) {
              const search = m[1]
              npmsio.search(search, 5, offset, (err, data) => {
                if (err) {
                  error(err, data)
                  telegram.reqWebhook(res, {
                    method: 'answerCallbackQuery',
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
          hit(j.inline_query.from.id, 'inline query')

          const query = j.inline_query.query.replace(/[^\w\d\s-_:@,/]+/gi, '').trim()

          if (query) {
            npmsio.suggestions(query, (err, results) => {
              if (err || !results.length) {
                error(err, results)
                telegram.reqWebhook(res, {
                  method: 'answerInlineQuery',
                  inline_query_id: j.inline_query.id,
                  results: []
                })
              } else {
                telegram.reqWebhook(res, {
                  method: 'answerInlineQuery',
                  inline_query_id: j.inline_query.id,
                  results: results
                })
              }
            })
          } else {
            telegram.reqWebhook(res, {
              method: 'answerInlineQuery',
              inline_query_id: j.inline_query.id,
              results: []
            })
          }
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
      // thumb
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
