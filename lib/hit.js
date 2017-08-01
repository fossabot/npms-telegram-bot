const clickhouse = require(`${__dirname}/clickhouse`)

const hit = (uid, type) => {
  if (name) {
    const r = clickhouse('INSERT INTO npms.hits (Name, UID) VALUES')
    r.end(`('${uid}'),(${type})`)
  }
}

module.exports = hit