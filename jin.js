var charset = require('superagent-charset')
var request = require('superagent')
var cheerio = require('cheerio')
var nodemailer = require('nodemailer')
var schedule = require('node-schedule')
charset(request)

var rootPath = 'http://online.ncu.edu.cn/eol'
var rule = new schedule.RecurrenceRule()
rule.hour = 6
rule.minute = 0

var sendMail = function (mes) {
  var transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: '1982764150@qq.com',
        pass: 'vqnanwxhgwvvbfgb'
    }
  })

  var mailOptions = {
    from: '1982764150@qq.com',
    to: '1161608440@qq.com',
    subject: '网络教学平台未读通知',
    text: '未读通知，待提交作业和带参与问卷',
    html: mes
  }

  transporter.sendMail(mailOptions, function (error, info) {
      error ? console.log(error) : console.log('Message sent: ' + info.response)
  })
}

var index = function (cookie) {
  request.get(rootPath + '/welcomepage/student/index.jsp')
    .charset('gbk')
    .set('Cookie', cookie[0].split(';')[0] + ';')
    .set('Origin', 'http://online.ncu.edu.cn')
    .set('Referer', rootPath + '/main.jsp')
    .end(function (err, res) {
      var $ = cheerio.load(res.text, {decodeEntities: false})
      var li = $('a[title=点击查看]', '#reminder')
      var noticeNum = $('span', li[0]).html()
      var workNum = $('span', li[1]).html()
      var questionNum = $('span', li[2]).html()
      var unreadContent = []
      var unreadTitle = ['<h5>未读通知</h5>', '<h5>待提交作业</h5>', '<h5>待参与问卷</h5>']
      var html = ''
      $('ul', '#reminder').each(function (i, elem) {
        unreadContent[i] = unreadTitle[i] + $(this).html()
      })

      unreadContent.forEach(function (value) {
        html += value
      })

      html += '</br>详情请查看' + '<a href="http://online.ncu.edu.cn">网络教学平台</a>'
      if ((+noticeNum + workNum + questionNum) !== 0) {
        sendMail(html)
      }
    })
}

var login = function (cookie) {
  request.post(rootPath + '/homepage/common/login.jsp')
    .set('Cookie', cookie[0].split(';')[0] + ';')
    .set('Origin', 'http://online.ncu.edu.cn')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Referer', 'http://online.ncu.edu.cn/eol/homepage/common/')
    .send({
        IPT_LOGINUSERNAME: '5504114003',
        IPT_LOGINPASSWORD: '123abc'
    })
    .end(function (err, res) {
      if (res) {
        index(cookie)
      }
    })
}

var getCookie = function () {
  request.get(rootPath + '/homepage/common/index.jsp')
    .end(function (err, res) {
      var cookie = res.headers['set-cookie']
      login(cookie)
    })
}

var j = schedule.scheduleJob(rule, function () {
    getCookie()
})