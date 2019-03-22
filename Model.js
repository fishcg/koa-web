const fs = require('fs')
// const db = require('./models/BaseDB')

let files = fs.readdirSync(__dirname + '/models')

let jsfiles = files.filter((f) => {
  if (f === 'BaseDb.js') {
    return false
  }
  return f.endsWith('.js')
}, files)

module.exports = {}

for (let f of jsfiles) {
  let name = f.substring(0, f.length - 3)
  module.exports[name] = require(__dirname + '/models/' + f)
}
/*
module.exports.sync = () => {
  db.sync()
}*/
