// http://docs.sequelizejs.com
const Sequelize = require('sequelize')
const uuid = require('node-uuid')
const { mysql } = require('../config/db')

function generateId() {
  return uuid.v4()
}

let sequelize = new Sequelize(mysql.database, mysql.user, mysql.password, {
  host: mysql.host,
  dialect: 'mysql',
  logging: () => {
    return false
  },
  freezeTableName: true,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
})

const ID_TYPE = Sequelize.INTEGER(10)

/**
 * 定义模型
 *
 * @param {String} name 表名
 * @param {Object} attributes 属性
 * @return {Model}
 */
function defineModel(name, attributes) {
  let attrs = {}
  for (let key in attributes) {
    let value = attributes[key]
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false
      attrs[key] = value
    } else {
      attrs[key] = {
        type: value,
        allowNull: false,
      }
    }
  }
  attrs.id = {
    type: ID_TYPE,
    primaryKey: true,
    autoIncrement: true,
  }
  attrs.create_time = {
    type: Sequelize.INTEGER(10),
    allowNull: false,
  }
  attrs.update_time = {
    type: Sequelize.INTEGER(10),
    allowNull: false,
  }
  let model =  sequelize.define(name, attrs, {
    tableName: name,
    timestamps: false,
    logging: false,
    hooks: {
      beforeValidate: function (obj) {
        let now = Date.now()
        if (obj.isNewRecord) {
          if (!obj.id) {
            // obj.id = generateId()
          }
          obj.create_time = now
          obj.update_time = now
        } else {
          obj.updatedAt = now
        }
      },
    },
  })
  /*model.attributes()= async () => {
    return this
  }*/
  return model
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN']

let exp = {
  defineModel: defineModel,
  sync: () => {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
      sequelize.sync({ force: true })
    } else {
      throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    }
  },
}

for (let type of TYPES) {
  exp[type] = Sequelize[type]
}

exp.ID = ID_TYPE
exp.generateId = generateId

module.exports = exp
