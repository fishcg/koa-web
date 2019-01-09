"use strict";

const Router = require('koa-router')
const SiteController = require('../controller/SiteController')
const SoundController = require('../controller/SoundController')


function controller(app) {
    let siteRouter = SiteController(new Router({ prefix: '/site' }))
    app.use(siteRouter.routes())
    let soundRouter = SoundController(new Router({ prefix: '/sound' }))
    app.use(soundRouter.routes())
    return app
}

module.exports = controller