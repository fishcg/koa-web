const Koa = require('koa')
const middleware = require('../middlewares/main')
const controller = require('../lib/controller')

const app = new Koa()

// 加载中间件
middleware(app)

// 设定路由
controller(app)


app.listen(9999, () => {
  console.log('异世界 --9999--> 启动')
})
