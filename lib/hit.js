const clickhouse = require('./clickhouse')
const error = require('./error')

const hit = (uid, type) => {
  if (uid) {
    const r = clickhouse('INSERT INTO hits (ID, Type) VALUES')
    r.on('error', error)
    r.end(`(${uid},'${type}')`)
  }
}

module.exports = hit
