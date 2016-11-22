var charset = require('superagent-charset')
var request = require('superagent')
var cheerio = require('cheerio')
var nodemailer = require('nodemailer')
charset(request)

request.get('http://online.ncu.edu.cn/eol/homepage/common/index.jsp')
  .end(function (err, res) {
    var cookie = res.headers['set-cookie']
    request.post('http://online.ncu.edu.cn/eol/homepage/common/login.jsp')
      .set('Cookie', cookie[0].split(';')[0] + ';')
      .set('Origin', 'http://online.ncu.edu.cn')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Referer', 'http://online.ncu.edu.cn/eol/homepage/common/')
      .send({
          IPT_LOGINUSERNAME: '5504114003',
          IPT_LOGINPASSWORD: '123abc'
      })
      .end(function(err, res) {
          request.get('http://online.ncu.edu.cn/eol/main.jsp')
            .set('Cookie', cookie[0].split(';')[0] + ';')
            .set('Origin', 'http://online.ncu.edu.cn')
            .set('Referer', 'http://online.ncu.edu.cn/eol/homepage/common/')
            .end(function (err, res) {
              request.get('http://online.ncu.edu.cn/eol/welcomepage/student/index.jsp')
                .charset('gbk')
                .set('Cookie', cookie[0].split(';')[0] + ';')
                .set('Origin', 'http://online.ncu.edu.cn')
                .set('Referer', 'http://online.ncu.edu.cn/eol/main.jsp')
                .end(function (err, res) {
                  var $ = cheerio.load(res.text, {decodeEntities: false})
                  var reminder = $('#reminder')
                  var li = $('a[title=点击查看]', '#reminder')
                  var noticeNum = $('span', li[0]).html()
                  var workNum = $('span', li[1]).html()
                  var questionNum = $('span', li[2]).html()
                  var unreadContent = []
                  var unreadTitle = ['<h5>未读通知</h5>', '<h5>待提交作业</h5>', '<h5>待参与问卷</h5>']
                  $('ul', '#reminder').each(function (i, elem) {
                    unreadContent[i] = unreadTitle[i] + $(this).html()
                  })

                  var html = ''
                  unreadContent.forEach(function (value) {
                    html += value
                  })
                  html += '</br>详情请查看' + '<a href="http://online.ncu.edu.cn">网络教学平台</a>'
                  if ((+noticeNum + workNum + questionNum) !== 0) {
                    var transporter = nodemailer.createTransport({
                        service: 'QQ',
                        auth: {
                            user: '1982764150@qq.com',
                            pass: 'vqnanwxhgwvvbfgb'
                        }
                    })

                    var mailOptions = {
                        from: '1982764150@qq.com',
                        to: '1506785369@qq.com',
                        subject: '网络教学平台未读通知',
                        text: '未读通知，待提交作业和带参与问卷',
                        html: html
                    }

                    transporter.sendMail(mailOptions, function(error, info){
                        error ? console.log(error) : console.log('Message sent: ' + info.response)
                    })
                  }
                })
            })
      })
  })