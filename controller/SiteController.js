"use strict";

function SiteController(router) {

    router.get("/ping", (ctx, next) => {
        ctx.body = "site pong";
    });

    router.get("/error", (ctx, next) => {
        throw new Error("site fuck");
    });

    return router;
}

module.exports = SiteController;