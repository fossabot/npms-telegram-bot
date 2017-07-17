const handle = (req, res) => {
  if (req.url === `/${config.webhook_secret}` && req.method === 'POST') {
    let s = ''
    res.on('data', _ => s += _)
    res.on('end', () => {
      // VALIDATE JSON
      const json = JSON.parse(s)
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