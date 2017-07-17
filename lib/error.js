const chalk = require('chalk')

module.exports = (...args) =>
  console.error(chalk.bgRed(args))
