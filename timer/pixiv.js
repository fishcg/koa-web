"use strict";

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(childProcess.exec);

/**
 * 获取音频相关信息
 *
 * @param {string} input_file 需要获取信息的音频
 * @param {string} [entries=duration,bit_rate] 需要打印的项，为空时打印所有。
 *
 * @returns {object} 音频信息
 *
 * @throws 文件不存在或者项不合法时报错
 */
async function getPicPageUrl() {
    let cmd = `python p.py`;
    let stdoutInfo = await execAsync(cmd)
    if (stdoutInfo.stdout === 'None') {
        return null
    }
    console.log(stdoutInfo.stdout)
}
getPicPageUrl()

/*
exports.getSoundInfo = getSoundInfo;
exports.toMP3 = toMP3;*/
