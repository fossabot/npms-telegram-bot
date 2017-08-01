
const deep_log = (...args) =>
  console.dir(args, { depth: 2, colors: true })

module.exports = deep_log