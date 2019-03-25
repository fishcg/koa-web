'use strict'

function SiteController(router) {

  router.get("/ping", (ctx, next) => {
    ctx.body = "site pong"
  })

  router.get("/error", (ctx, next) => {
    throw new Error("site fuck");
  })

  router.get("/test", (ctx, next) => {
    ctx.render('test', {
      value: '<script>alert(233)</script>',
      target: [
        'apple',
        'phone',
      ],
    })
  })

  router.get("/index", (ctx, next) => {
    ctx.render('index', {
      value: '<script>alert(233)</script>',
      target: [
        'apple',
        'phone',
      ],
    })
  })

  return router
}

module.exports = SiteController
