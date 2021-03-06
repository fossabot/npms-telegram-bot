
const moment = require('moment')
const isJson = require('is-json')
const crypto = require('crypto')

const config = require('./../config')
const resCb = require(`./resCb`)
const resChunk = require(`./resChunk`)
const libGet = require('./get').get
const libRequest = require('./get').request

const get = (method, options = {}, cb = resCb) => {
  return libGet(config.npmsURL, method, options, cb)
}

const request = (method, options = {}, cb = resCb) => {
  return libRequest('api.npms.io', '/v2', method, options, cb)
}

const fScore = num => {
  const r = (num * 100).toString()
  return r.slice(0, r.indexOf('.'))
}

const search = (search, size = config.searchSize, offset = 0, cb) => {
  if (typeof size === 'function') {
    cb = size
    size = config.searchSize
  }
  if (typeof offset === 'function') {
    cb = offset
    offset = 0
  }
  npmsio.request(
    'search',
    {q: search, from: offset, size: size},
    (resc) => resChunk(resc, (err, data) => {
      if (err || !isJson(data)) {
        cb(err, data)
      } else {
        const jsonData = JSON.parse(data)
        const bar = {}

        if (jsonData.total) {
          if (jsonData.total > 5) {
            const foo = offset - size
            const prev = offset ? {text: 'Prev', callback_data: (foo < 0 ? 0 : foo).toString()}
              : {text: 'Refresh', callback_data: '0'}

            bar.reply_markup = {inline_keyboard: [[prev, {text: 'Next', callback_data: (offset + size).toString()}]]}
          }

          let packages = `_ ${jsonData.total} results for ${search} _\n`

          for (const i of jsonData.results) {
            const username = i.package.publisher.username
            const score = fScore(i.score.final)
            let flags = ''

            for (const k in i.flags) {
              flags += `*[${k}]* `
            }

            packages += `\n[${i.package.name}](${i.package.links.npm}) ` +
                      `\`(${i.package.version})\` *${score}%*\n` +
                      `${flags}\`\`\`text\n${i.package.description}\`\`\`\n` +
                      `_updated ${moment(i.package.date).fromNow()} ` +
                      `by _ [${username}](https://npmjs.com/~${username})\n`
          }

          bar.text = packages
        }

        cb(null, bar)
      }
    })
  )
}

const info = (packageName, cb) => {
  npmsio.request(`package/${packageName}`, {}, (resc) => resChunk(resc, (err, data) => {
    if (err || !isJson(data)) {
      cb(err, data)
    } else {
      const jsonData = JSON.parse(data)
      const c = jsonData.collected
      const meta = c.metadata
      const username = meta.publisher.username

      let info = `[${meta.name}](${meta.links.npm}) \`(${meta.version})\`\n`

      info += `\`${meta.description}\`\n`
      info += `_updated ${moment(meta.date).fromNow()} `
      info += `by _ [${username}](https://npmjs.com/~${username})\n\n`

      info += `license \`${meta.license}\`\n`

      const coverage = fScore(jsonData.collected.source.coverage)
      info += `coverage \`${coverage}%\`\n\n`

      info += `*npm*\ndependencies \`${c.npm.dependentsCount}\`\n`
      info += `stars \`${c.npm.starsCount}\`\n\n`

      info += `*github*\nforks \`${c.github.forksCount}\`\n`
      info += `stars \`${c.github.starsCount}\`\n`
      info += `subscribers \`${c.github.subscribersCount}\`\n`
      info += `open issues \`${c.github.issues.openCount} of ${c.github.issues.count}\`\n\n`

      const quality = fScore(jsonData.score.detail.quality)
      const popularity = fScore(jsonData.score.detail.popularity)
      const maintenance = fScore(jsonData.score.detail.maintenance)

      info += `quality \`${quality}%\`\n`
      info += `popularity \`${popularity}%\`\n`
      info += `maintenance \`${maintenance}%\`\n\n`

      info += `_analyzed ${moment(jsonData.analyzedAt).fromNow()} by _ [npms-analyzer](https://github.com/npms-io/npms-analyzer)`

      cb(null, info)
    }
  })
  )
}

const suggestions = (search, cb) => {
  npmsio.request(
    'search/suggestions',
    {q: search},
    (resc) => resChunk(resc, (err, data) => {
      if (err || !isJson(data)) {
        cb(err, data)
      } else {
        const jsonData = JSON.parse(data)
        const results = []

        for (const i of jsonData) {
          const updated = `updated ${moment(i.package.date).fromNow()} by ${i.package.publisher.username}`
          const description = i.package.description ? i.package.description.slice(0, 32) + '...' : ''
          let flags = ''

          for (const k in i.flags) {
            flags += `[${k}]`
          }

          const options = {
            type: 'article',
            id: crypto.createHash('sha256').update(i.package.name).digest('hex'),
            title: i.package.name,
            input_message_content: {message_text: i.package.links.npm},
            url: i.package.links.npm,
            description: `${flags} ${description}\n${updated}`
          }
          results.push(options)
        }

        cb(null, results)
      }
    })
  )
}

const npmsio = {get, request, search, info, suggestions}

module.exports = npmsio
