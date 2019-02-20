const http = require('http')
const querystring = require('querystring')

/**
 * http模块发送请求
 * @param host
 * @param port
 * @param route
 * @param params 参数
 * @param headers
 * @param encoding 可选值： utf8 binary
 */
async function ajaxAsync(options, encoding = 'utf8') {
    let postData = ''
    if (options.params) {
        postData = querystring.stringify(options.params)
    }
    options.headers['Content-Length'] = Buffer.byteLength(postData)
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function(res) {
            res.setEncoding(encoding);
            var data = ''
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if (options.dataType === 'json' ) {
                    resolve(JSON.parse(data));
                } else {
                    resolve({result: true, data: data, headers: res.headers});
                }

            });
        });
        req.on('error', (e) => {
            resolve({result: false, errmsg: e.message});
        });
        req.write(postData);
        req.end();
    });
}

function ajax(options, cb, encoding = 'utf8') {
    let postData = ''
    if (options.params) {
        postData = querystring.stringify(options.params)
    }
    if (!options.dataType) {
        options.dataType = 'html'
    }
    let req = http.request(options, function(res) {
        res.setEncoding(encoding);
        var data = ''
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if (options.dataType === 'json' ) {
                data = JSON.parse(data)
            }
            cb(data)
        });
    });
    req.on('error', (e) => {
        console.log(e)
    })
    req.write(postData)
    req.end()
}

/**
 * http模块发送请求
 * @param host
 * @param port
 * @param route
 * @param params 参数
 * @param headers
 * @param encoding 可选值： utf8 binary
 */
async function ajaxAsync(options, encoding = 'utf8') {
    let postData = ''
    if (options.params) {
        postData = querystring.stringify(options.params)
    }
    options.headers['Content-Length'] = Buffer.byteLength(postData)
    return new Promise(function (resolve, reject) {
        let req = http.request(options, function(res) {
            res.setEncoding(encoding);
            var data = ''
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if (options.dataType === 'json' ) {
                    resolve(JSON.parse(data));
                } else {
                    resolve({result: true, data: data, headers: res.headers});
                }

            });
        });
        req.on('error', (e) => {
            resolve({result: false, errmsg: e.message});
        });
        req.write(postData);
        req.end();
    });
}

/**
 * http模块发送请求
 * @param host
 * @param port
 * @param route
 * @param params 参数
 * @param headers
 * @param encoding 可选值： utf8 binary
 */
async function getAsync(url, encoding = 'utf8') {
    return new Promise(function (resolve, reject) {
        http.get(url, function(res) {
            var size = 0;
            var chunks = [];
            res.on('data', function(chunk){
                size += chunk.length;
                chunks.push(chunk);
            });
            res.on('end', function(){
                var data = Buffer.concat(chunks, size);
                resolve({result: true, data: data.toString(), headers: res.headers});
            });
        }).on('error', function(e) {
            resolve({result: false, errmsg: e.message});
        })
    });
}


exports.ajax = ajax
exports.ajaxAsync = ajaxAsync
exports.getAsync = getAsync
