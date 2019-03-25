// const nunjucks = require('nunjucks')
const template = require('art-template')

function createHtml(path, view, data, opts) {
  template.defaults.escape = opts.escape || true
  template.defaults.cache = opts.cache || false
  template.defaults.minimize = opts.minimize || true
  template.defaults.extname = opts.extname || '.html'
  template.defaults.root = path
  return template(view, data)
}

function view(path) {
  return async (ctx, next) => {
    let viewFilePath = path
    ctx.render = (view, data, opts) => {
      if (view.split('/').length === 1) {
        let paths = ctx.path.split('/')
        if (paths.length === 3) {
          viewFilePath += `/${paths['1']}`
        } else if (paths.length === 4) {
          viewFilePath += `/${paths['1']}/${paths['2']}`
        }
      }
      opts = opts || {}
      ctx.response.body = createHtml(viewFilePath, view, data, opts)
      ctx.response.type = 'text/html'
    }
    await next()
  }
}

/*function createHtml(path, opts) {
  let
    // autoescape = opts.autoescape === undefined ? true : opts.autoescape,
    noCache = opts.noCache || false,
    watch = opts.watch || false,
    throwOnUndefined = opts.throwOnUndefined || false,
    html = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(path, {
        noCache: noCache,
        watch: watch,
      }), {
        autoescape: autoescape,
        throwOnUndefined: throwOnUndefined,
      })
  if (opts.filters) {
    for (let f in opts.filters) {
      html.addFilter(f, opts.filters[f])
    }
  }
  return html
}

function templating(path, opts) {
  let html = createHtml(path, opts)
  return async (ctx, next) => {
    ctx.render = (view, model) => {
      ctx.response.body = html.render(view, Object.assign({}, ctx.state || {}, model || {}))
      ctx.response.type = 'text/html'
    }
    await next()
  }
}*/

module.exports = view