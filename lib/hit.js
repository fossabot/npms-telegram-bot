
// module.exports = {
//     init: function (n, cb) {
// 	cb({key:''})
//     },
//     hit: ,
//     _get: function (req, res, list) {
// 	let name = req.url.split('/').slice(0, 16)
// 	list['hit'].hit(name[name.length-1])
// 	res.writeHead(200, {'Content-Type': 'image/gif'})
// 	res.end(Buffer('474946383961010001008000000000000000002c00000000010001000002024401003b', 'hex'))
//     }
// }

const clickhouse = require(`${__dirname}/db`)

const hit = (name, uid) => {
  if (name) {
    const r = db('INSERT INTO nodes.hits (Name, UID) VALUES')
    r.end(`('${name}'),(${uid})`)
  }
}

