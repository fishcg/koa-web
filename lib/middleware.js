"use strict"

const bodyParser = require('koa-bodyparser')
const getRawBody = require('raw-body')
const validator = require('validator')
const { hash_hmac, base64_decode } = require('../component/Utils')
const { SECRET_KEY } = require("../config/key")
const { env } = require("../config/system")

function middleware(app) {
    // 设置响应时长
    app.use(async (ctx, next) => {
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      ctx.set('X-Response-Time', `${ms}ms`)
    })
    if (env === 'dev') {
        app.use(logger()) // 开发环境添加请求日志
    }
    // 错误处理
    app.use(handleError)
    // @todo 处理 RPC 请求
    // app.use(rpc)
    // 处理 body 参数
    app.use(bodyParser())
    // 设置请求的全局信息
    app.use(setHeader)
    return app
}


async function handleError(ctx, next) {
    try {
        await next()
        // @WORKAROUND 调试结束后移除
        console.log(ctx.response.status)
        if (!ctx.body) return  ctx.body = { success: false, info: 'Not Found' }
        if (ctx.accepts('application/json') === ctx.request.type) {
            ctx.body = { success: true, info: ctx.body }
        }

    } catch(e) {
        // @WORKAROUND 调试结束后移除
        console.log(ctx.response.status)
        // @TODO 报错需要发送邮件
        let msg = (typeof e === 'object') ? e.message : e
        ctx.body = {
            success: false,
            info: msg,
        }
    }
}

// 处理 js 跨域问题
async function setHeader(ctx, next) {
    let origin = ctx.request.header.origin
    if (/.+\.missevan\.com|test.com/.test(origin)) {
        ctx.response.set('Access-Control-Allow-Origin', origin)
    }
    await next()
}

// 处理 rpc 请求
async function rpc(ctx, next) {
    if (ctx.request.method === 'POST') {
        // TODO: 之后应只对路由中 /rpc 下的接口做此验证
        let body = await getRawBody(ctx.req, { encoding: true })
        body = parseBody(body)
        if (!body) {
            ctx.response.status = 403
            throw new Error('无权访问')
        }
        ctx.request.body = body
    }
    await next()
}

/**
 * 解析 rpc 请求中的 body
 *
 * @param {String} body 要解析的字符串，格式：<encodeData> <sign> <timestamp>
 * @return {Object|null} 请求的参数
 */
function parseBody(body) {
    if (body && typeof body === 'string') {
        let parts = body.split(' ')
        if (parts.length === 3 && validator.isNumeric(parts[2])) {
            let rt = parseInt(parts[2])
            let now = Math.floor(Date.now() / 1000)
            if (Math.abs(now - rt) < 100) {
                let encodeData = parts[0]
                let text = encodeData + ' ' + parts[2]
                // 验证 sign
                let hash = hash_hmac('sha256', text, SECRET_KEY)
                if (hash === parts[1]) {
                    return JSON.parse(base64_decode(encodeData))
                }
            }
        }
    }
    return null
}

module.exports = middleware