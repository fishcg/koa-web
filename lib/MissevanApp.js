const URL = require('url')
const Https = require('./Https.js')
const Http = require('./Http.js')
const Nedb = require('./NedbConnection.js')
const R =  require('ramda')
const crypto = require('crypto');
const fs = require('fs');
const http = require('http')

const DOMAIN = 'app.missevan.com'
const STATIC = 'http://static.missevan.com'
const DH_P = '5545646546445646546544654645'
const DH_G = '5456465465456456465465456461'

/*const HEADERS = {
    'Host': DOMAIN,
    'equip-code': '19485486-65ba-4508-90e4-1376e7d4deb8',
    'Cookie': 'equip_code=19485486-65ba-4508-90e4-1376e7d4deb8;',
    'Connection': 'keep-alive',
    'Accept': 'application/json',
    'User-Agent': 'MissEvanApp/4.1.9 (iOS;12.0;iPhone9,1)',
    'Accept-Language': 'zh-Hans-CN;q=1',
    'Content-Type': 'application/x-www-form-urlencoded',
    // 'token': '5c1b0bec3cd118adcafc4934|6e63f3ec9345676c|1545276396|a484157067889856'
}*/
const HEADERS = {
    'Host': DOMAIN,
    'equip-code': '840378b3-730b-410f-9347-4230b95f42a3',
    'Cookie': 'SERVERID=ce8d56a81265998d6013d20b05999456|1550543921|1550543852; equip_code=840378b3-730b-410f-9347-4230b95f42a3; token=5c6ad91e7b8e438d6d84e4b2|88d3d1cff2551560|1550506270|b58a4b155756a1dd',
    'Connection': 'keep-alive',
    'Accept': 'application/json',
    'User-Agent': 'MissEvanApp/4.1.9 (iOS;12.0;iPhone9,1)',
    'Accept-Language': 'zh-Hans-CN;q=1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'token': '5c6ad91e7b8e438d6d84e4b2|88d3d1cff2551560|1550506270|b58a4b155756a1dd'
}
class MissevanApp {

     constructor() {
        this.domain = DOMAIN
        this.header = HEADERS
        this.static = STATIC
        this.soundPath = this.static + '/sound'
    }

    /**
     * test
     *
     * @return {Promise.<*>}
     */
    async test() {
        await this.holdLogin();
        let top = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/site/editor-choice',
            method: 'GET',
            // dataType: 'json',
            headers: this.header
        })
        return top
    }

    /**
     * 获取首页 banner 图及广播剧打赏榜
     *
     * @return {Promise.<*>}
     */
    async getTop() {
        await this.holdLogin();
        let top = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/site/get-top',
            method: 'GET',
            dataType: 'json',
            headers: this.header
        })
        return top
    }

    /**
     * 获取首页推荐模块
     *
     * @return [Number]
     */
    async getModules(persona) {
        let res = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/you-might-like/my-favors?persona_id=' + persona,
            method: 'GET',
            dataType: 'json',
            headers: this.header
        })
        let modules = [];
        if (!res.success) return modules
        for (module of res.info) {
            let moduleID = module.module_id
            modules.push(moduleID)
        }
        return modules
    }

    /**
     * 获取首页推荐模块详情
     *
     * @return [Number]|fasle
     */
    async getModulesDetail(moduleID) {
        let res = await Https.ajaxAsync({
            hostname: this.domain,
            path: `/you-might-like/favor-detail?module_id=${moduleID}&page=1&page_size=18`,
            method: 'GET',
            dataType: 'json',
            headers: this.header
        })
        if (!res.success) {
            console.log('获取详情失败: ' + moduleID)
            return false
        }
        return res.info.Datas
    }

    /**
     * 切换用户画像
     *
     * @return {Promise.<*>}
     */
    async switchPersona(gender) {
        let res = await Https.ajaxAsync({
            hostname: this.domain,
            path: `/you-might-like/save-my-favor`,
            method: 'POST',
            params: {gender: gender},
            dataType: 'json',
            headers: this.header
        })
        if (!res.success) return false
        return res.info
    }

    /**
     * 获取分类缓存
     *
     * @return {Promise.<*>}
     */
    async editorChoice() {
        await this.holdLogin();
        let res = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/site/editor-choice',
            method: 'GET',
            headers: this.header
        })
        let jsonUrl = res.headers.location;
        let pageRes = await Http.getAsync(jsonUrl);
        return JSON.parse(pageRes.data)
    }

    /**
     * 获取猜你喜欢音
     *
     * @return {Promise.<*>}
     */
    async getLikeSounds() {
        await this.holdLogin();
        let sounds = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/you-might-like/get-sounds?persona_id=2',
            method: 'GET',
            dataType: 'json',
            headers: this.header
        })
        return sounds
    }
    async getSoundAsync(ID) {
        var ID = parseInt(ID)
        if (ID <= 0) throw new Error('音频 ID 不合法')
        let sounds = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/sound/sound?sound_id=' + ID,
            method: 'GET',
            dataType: 'json',
            headers: this.header
        })
        return sounds
    }

    async login(params, cb) {
        let res = await Https.ajaxAsync({
            hostname: this.domain,
            path: '/member/login',
            method: 'POST',
            // dataType: 'json',
            params: params,
            headers: this.header
        })
        let data = ''
        try {
            data = JSON.parse(res.data)
            if (!data.success) {
                let errorKeys = R.keys(data.info)
                let errorInfo = errorKeys[0] !== undefined ? data.info[errorKeys[0]][0] : data.info
                cb(res, new Error(errorInfo))
                return
            }
            let token = data.info.token
            let cookie = `equip_code=${this.header['equip-code']};token=${token}`;
            // 客户端注册用户
            await this.online(params.account)
            // 存入 cookie 与 token
            let user = await Nedb.countAsync({ doc: Nedb.doc.USER, account: params.account })
            if (user) {
                await Nedb.updateASync(
                    { doc: Nedb.doc.USER, account: params.account },
                    { $set: { token: token, cookie: cookie } }
                )
            } else {
                await Nedb.insertASync({
                    doc: Nedb.doc.USER,
                    account: params.account,
                    token: token,
                    cookie: cookie
                })
            }
            cb(data)
        } catch (e) {
            cb(res, e)
        }
    }

    async online(account){
        let online = await Nedb.countAsync({ doc: Nedb.doc.ONLINE })
        if (online > 0) {
            await Nedb.updateASync(
                {  doc: Nedb.doc.ONLINE },
                { $set: { account: account } }
            )
        } else {
            await Nedb.insertASync({ doc: Nedb.doc.ONLINE, account: account })
        }
    }

    async holdLogin() {
        /* @debug 使用固定的 header 进行登录
        return */
        let online = await Nedb.findOneASync({ doc: Nedb.doc.ONLINE })
        if (online) {
            let user = await Nedb.findOneASync({ doc: Nedb.doc.USER, account: online.account })
            this.header.Cookie = user.cookie
            this.header.token = user.token
        }
    }
}
function stringToUint8Array(str){
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }

    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}

function Uint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }

    return dataString
}

module.exports = new MissevanApp()

