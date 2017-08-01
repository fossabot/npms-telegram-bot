
const is_json = require('is-json')
const moment = require('moment')

const hit = require(`${__dirname}/hit`)
const telegram = require(`${__dirname}/telegram`)
const npmsio = require(`${__dirname}/npmsio`)
const resChunk = require(`${__dirname}/resChunk`)
const config = require(`${__dirname}/../config`)

const handle = (req, res) => {
  console.log(req.url, req.url === `/${config.webhook_secret}`)
  if (req.url === `/${config.webhook_secret}` && req.method === 'POST') {
    console.log('POST')
    let s = ''
    req.on('data', c => s += c)
    req.on('end', () => {
      console.log('hello')
      if (is_json(s)) {
        const j = JSON.parse(s)
        console.log('j')
        if (j.message.chat.type === 'private') {
          //hit(s.message.chat.id, s.message.chat.type)
          console.log('private')
          if (j.message.text.startsWith('/start') || j.message.text.startsWith('/about'))
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: config.about_text
            })
          else if (j.message.text.startsWith('/info'))
            telegram.reqWebhook(res, {
              method: 'sendMessage',
              chat_id: j.message.chat.id,
              parse_mode: 'markdown',
              text: 'work on. info'
            })
          else {
            const search = j.message.text.replace(/[^\w\d\s-_:]+/gi, '').trim()
            npmsio.request(
              'search', 
              {q: search, from: 0, size: 5},
              (resc) => resChunk(resc, (err, data) => {
                if (err) {
                  error(err)
                  telegram.reqWebhook(res, {
                    method: 'sendMessage',
                    chat_id: j.message.chat.id,
                    text: 'error'
                  })
                } else {
                  const jsonData = JSON.parse(data)
                  let packages = `_ ${offset+size} / ${jsonData.total} results for moment_\n`
                  for (x in jsonData.results) {
                    const i = jsonData.results[x]
                    const username = i.package.publisher.username
                    const score = (i.score.final * 100).toString().slice(0, 2)
                    let flags = ''

                    for (k in i.flags)
                      flags += `*[${k}]* `

                    packages += `\n[${i.package.name}](${i.package.links.npm}) `
                              + `\`(${i.package.version})\` *${score} / 100*\n`
                              + `${flags}\`\`\`text\n${i.package.description}\`\`\`\n`
                              + `_updated ${moment(i.package.date).fromNow()} `
                              + `by _ [${username}](https://npmjs.com/~${username})\n`
                  }
                  
                  telegram.reqWebhook('sendMessage', {
                    chat_id: j.message.chat.id,
                    parse_mode: 'markdown',
                    text: packages,
                    disable_web_page_preview: true,
                    reply_markup: JSON.stringify({inline_keyboard: [[{text: 'Refresh'}, {text: 'Next', callback_data: `5,${search}`}]]})
                  })
                }
              })
            )
          }
        }
      }
      // cmds
      // search
      // clickhouse cache
      // inline mode
      // serch list
      // group announce
      // payment donate
    })
  } else {
    res.writeHead(404)
    res.end('404 not found')
  }
}

module.exports = handle