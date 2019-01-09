"use strict";

const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const { promisify } = require('util')
const nedb = require('../lib/NedbConnection')
const logger = require('../lib/Logger')
const admin = require('../config/admin')
const Email = require('../component/Email')
const { TEMP_PATH, PYTHON } = require('../config/system')

const execAsync = promisify(childProcess.exec)
const pixivPath = path.join(TEMP_PATH, 'pixiv')

/**
 * 发送 PIXIV 图片到指定邮箱
 *
 */
async function getPixivPageUrl() {
    let cmd = `${PYTHON} ../script/pixiv/newPixiv.py ${pixivPath}`;
    let stdoutInfo = await execAsync(cmd, { encoding: 'utf8' })
    let stdout = stdoutInfo.stdout.replace(/[\r\n]/g, '')
    if (stdout === 'None') {
        logger.warn('获取 PIXIV 图片页地址出错');
        return
    }
    let pixivInfo = JSON.parse(stdout)
    let pageUrl = pixivInfo.url
    if (pageUrl === 'None') {
        return null
    }
    // 查询最新的图片页面记录
    let pixiv = await nedb.findOneASync({ doc_type: nedb.docTypes.PIXIV })
    if (!pixiv) {
        // 若不存在，创建新记录
        pixiv = await nedb.insertASync({ doc_type: nedb.docTypes.PIXIV, page_url: pageUrl })
    } else if (pixiv.page_url === pageUrl) {
        console.log("need't update")
        return
    }
    // 若记录值不同，替换为最新图片页面地址并下载
    await nedb.updateASync({ doc_type: nedb.docTypes.PIXIV}, { $set: { page_url: pageUrl } })
    let filePath = await getPixivFile()
    if (!filePath) {
        logger.warn('图片压缩包地址出错')
        return
    }
    // 转码失败时发送邮件通知管理员
    let email = new Email(admin.pixiv)
    let subject = '美图投稿'
    let content = `<b style="color: #6c9e71">[投稿主题]</b></br>${pixivInfo.title}</br>
        <b style="color: #9e534b">[投稿信息]</b></br>详情参见附件。</br>by 鱼鱼鱼`
    await email
      .addAttachment([{"filename": `${pixivInfo.title}.zip`, "path": filePath }])
      .send(subject, content)
    logger.warn('美图投稿邮件发送成功')
}

/**
 * 获取 pixiv 图片压缩包地址
 *
 * @param pageUrl
 *
 * @returns {String} pixiv 图片压缩包地址
 */
async function getPixivFile() {
    let cmd = `${PYTHON} ../script/pixiv/getFile.py ${pixivPath}`;
    let stdoutInfo = await execAsync(cmd, { encoding: 'utf8' })
    let stdout = stdoutInfo.stdout.replace(/[\r\n]/g, '')
    if (stdout === 'None') {
        return null
    }
    return stdout
}
try {
    getPixivPageUrl()
} catch(e) {
    logger.error(`美图投稿邮件错误，错误原因：${e.stack || e}`)
}

