const MissevanApp = require('../lib/MissevanApp')
const Utils = require('../component/Utils')
const logger = require('../lib/Logger')
const Email = require('../component/Email')
const admin = require('../config/admin')

// 发送邮件
let email = new Email(admin.MissevanTest)
let subject = '猫耳FM 首页推荐模块出错'

async function check(){
  let genders = [1, 2];  // 1: 男；2：女
  for (gender of genders) {
    let persona = await MissevanApp.switchPersona(gender)
    if (!persona) continue
    let personaName = persona == 2 ? '男用户画像' : '女用户画像'
    logger.info(`检测画像：${personaName}`)
    let ModuleIDs = await MissevanApp.getModules(persona)
    for (let moduleID of ModuleIDs) {
        let elements = await MissevanApp.getModulesDetail(moduleID)
        if (!elements) {
            logger.info(`模块详情请求失败：${moduleID}`)
            continue
        }
        elementLength = elements.length
        if (0 === elementLength) {
            sendEmail(persona, moduleID)
        }
        await Utils.asyncSleep(2000)
    }
  }
}

async function sendEmail(persona, moduleID) {
    let personaName = persona == 2 ? '男用户画像' : '女用户画像'
    let content = `<b style="color: #6c9e71">[出错画像]</b><br />${personaName}<br />
        <b style="color: #9e534b">[出错模块]</b><br />${moduleID}`
    await email.send(subject, content)
    logger.info(`出错画像：${personaName}，出错模块 ID：${moduleID}`)
}

// 每 5 分钟执行一次检查
Utils.timingTask(check, 300)