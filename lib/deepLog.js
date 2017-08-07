
const deepLog = (...args) =>
  console.dir(args, { depth: 2, colors: true })

module.exports = deepLog
