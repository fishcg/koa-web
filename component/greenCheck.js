const fs = require('fs')
const util = require('util')
const readline = require('readline')
const lineReader = require('line-reader')

let readlineAsync = util.promisify(lineReader.eachLine)

class TextCheck {
  constructor(dataPath) {
    this.keywords = []
    this.kwsets = {}
    this.bsdict = {}
    this.dataPath = dataPath
    this.init(null, () => {
      console.log('已加载。。')
    })
    // this.pat_en = re.compile(r'^[0-9a-zA-Z]+$')  # english phrase or not
  }
  add(keyword) {
    if (typeof keyword === undefined) {
      return
    }
    keyword = String(keyword).toLowerCase()
    if (!keyword) {
      return
    }
    if (!(keyword in this.kwsets)) {
      this.keywords.push(keyword)
      this.kwsets[keyword] = '\x00'
      let index = this.keywords.length - 1
      let wordArr = keyword.split(/ |\r|\n/)
      for (let i = 0, len = wordArr.length; i < len; i++) {
        let word = wordArr[i]
        for (let j = 0,len2 = word.length; j < len2; j++) {
          let char = word[j]
          if (this.bsdict[char]) {
              this.bsdict[char][index] = ''
          } else {
            this.bsdict[char] = {}
            this.bsdict[char][index] = ''
          }
        }
      }
    }
  }

  filter(message, repla="*") {
    if (typeof message === undefined) {
      return message
    }
    message = String(message).toLowerCase()
    if (!message) {
      return message
    }
    let messageArr = message.split(/ |\r|\n/)
    for (let i = 0, len = messageArr.length; i < len; i++) {
      let word = messageArr[i]
      for (let j = 0,len2 = word.length; j < len2; j++) {
        let char = word[j]
        for (let index in this.bsdict[char]) {
          let aa = this.keywords[index]
          message = message.replace(aa, repla)
        }
      }
    }
    return message
  }

  init(newDataPath, cb) {
    let dataPath = newDataPath || this.dataPath
    readlineAsync(dataPath, line => {
      this.add(line)
    }).then(function() {
      cb()
    }).catch(function(err) {
      console.error(err)
    })
  }
}

var textCheck = new TextCheck('keywords')

function createLineReader(fileName) {
  fs.watch(fileName, (eventType, filename) => {
    if (eventType === 'change') {
      textCheck = new TextCheck('keywords')
    }
  })
}

createLineReader('keywords')
module.exports=textCheck
/*setInterval(function () {
  let t = new Date().getTime()
  console.log(t)
  console.log(gfw.filter('JS时间格式阳与时间戳的相互转换 有些时候在写前端的时候,需要用到一些时间,但是时间的格式又比较多,除了时间戳之外,还有各种各样的格式我操傻逼就是你习近平卖淫', "*"))
  console.log(new Date().getTime() - t)
}, 2000)*/
// gfw.add('法轮功')

/* console.log(last_level)
ff.init('text.txt')*/

// createLineReader('text.txt')
