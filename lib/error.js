
const chalk = require('chalk')

const deepLog = require('./deepLog')

const error = (...args) => {
  console.log(chalk.bgRed('ERROR'), chalk.black(' '))
  deepLog(...args)
}

module.exports = error
