// 加载全局所需的模块
const dotenv = require('dotenv')
const moment = require('moment-timezone')
const sendEmail = require('./utils/sendEmail')

// 加载env参数
dotenv.config({ path: './config/config.env' })

// 处理uncaught promise exception
process.on('uncaughtException', (reason) => {
  console.log('|---------------------------------------------------')
  console.log('| 发生uncaughtException错误'.red.bold)
  console.log(`| 错误:${reason.name}, 理由为: ${reason.message}`.red.bold)
  if (process.env.NODE_ENV === 'development') {
    console.log('| 错误发生在Promise:'.red.bold)
    console.log('| ', reason)
  }
  console.log('|---------------------------------------------------')
  // application specific logging, throwing an error, or other logic here
  if (process.env.NODE_ENV === 'production') {
    console.log('| 正在收集错误日志...'.green.bold)
    const options = {
      email: process.env.ADMIN_EMAIL,
      subject: `${process.env.APP_NAME}出现uncaughtException问题，请关注`,
      template: process.env.MAILGUN_ERROR_TEMPLATE,
      systemDownError: `错误:${reason.name}, 理由为: ${reason.message} ${reason}`
    }
    sendEmail(options)
    console.log('| 已发送错误日志邮件至管理员'.green.bold)
  }
  console.log('| 正在结束进程...'.green.bold)
  console.log('| 后台服务器已正常关闭'.green.bold)
  console.log('|---------------------------------------------------')
  process.exit(1)
})

// 加载Express
const app = require('./app')

// 加载mongoose连接数据库
const connectDB = require('./database')

// 连接数据库
connectDB()

// 定义端口
const PORT = process.env.PORT || 5000

console.log('|---------------------------------------------------')
console.log('| 正在启动后台服务器...'.green.bold)

// Express监听端口服务
const server = app.listen(PORT, () => {
  const date = moment()
    .tz(`${process.env.LOG_TIME_ZONE}`)
    .locale(`${process.env.LOG_LANGUAGE}`)
    .format(`${process.env.LOG_FORMAT}`)
  console.log('| 后台服务器已启动'.green.bold)
  console.log('|---------------------------------------------------')
  console.log(`| 应用名  : ${process.env.APP_NAME}`.yellow.bold)
  console.log(`| 部署环境: ${process.env.NODE_ENV}`.yellow.bold)
  console.log(`| 部署端口: ${process.env.PORT}`.yellow.bold)
  console.log(`| 部署日期: ${date}`.yellow.bold)
  console.log('|---------------------------------------------------')
  console.log('| 正在连接数据库...'.green.bold)
})

// 处理unhandled promise rejection
process.on('unhandledRejection', (reason, p) => {
  console.log('|---------------------------------------------------')
  console.log('| 发生unhandledRejection错误'.red.bold)
  console.log(`| 错误:${reason.name}, 理由为: ${reason.message}`.red.bold)
  if (process.env.NODE_ENV === 'development') {
    console.log('| 错误发生在Promise:'.red.bold)
    console.log('| ', reason)
    console.log('| 错误发生Promise的Stack细节:'.red.bold)
    console.log('| ', p)
  }
  console.log('|---------------------------------------------------')
  console.log('| 正在关闭后台服务器...'.green.bold)
  // application specific logging, throwing an error, or other logic here
  server.close(() => {
    process.exit(1)
  })
  console.log('| 后台服务器已正常关闭'.green.bold)
  if (process.env.NODE_ENV === 'production') {
    console.log('| 正在收集错误日志...'.green.bold)
    const options = {
      email: process.env.ADMIN_EMAIL,
      subject: `${process.env.APP_NAME}出现unhandledRejection问题，请关注`,
      template: process.env.MAILGUN_ERROR_TEMPLATE,
      systemDownError: `错误:${reason.name}, 理由为: ${reason.message} ${reason}`
    }
    sendEmail(options)
    console.log('| 已发送错误日志邮件至管理员'.green.bold)
  }
  console.log('|---------------------------------------------------')
})
