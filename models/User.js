const db = require('./BaseDb')

module.exports = db.defineModel('user', {
  username: db.STRING(33),
  email: {
    type: db.STRING(100),
    unique: true,
    // allowNull: false,  // allowNull defaults to true
  },
  mobile: {
    type: db.STRING(20),
    unique: true,
  },
  password: db.STRING(32),
  gender: db.BOOLEAN,
  reg_ip: {
    type: db.STRING(15),
    allowNull: true,
  },
  xp: {
    type: db.INTEGER(11),
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: db.INTEGER(3),
    allowNull: true,
  },
  avatar: db.STRING(128),
})