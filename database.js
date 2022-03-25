const mongoose = require('mongoose')
const moment = require('moment-timezone')

const connectDB = async () => {
  const date = moment()
    .tz(`${process.env.LOG_TIME_ZONE}`)
    .locale(`${process.env.LOG_LANGUAGE}`)
    .format(`${process.env.LOG_FORMAT}`)
  const connection = await mongoose.connect(
    process.env.MONGO_URI.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    ).replace('<MONGO_COLLECT_NAME>', process.env.MONGO_COLLECT_NAME),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  console.log(
    `| MongoDB 数据库 URI: ${process.env.MONGO_URI.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    )
      .replace('<MONGO_COLLECT_NAME>', process.env.MONGO_COLLECT_NAME)
      .slice(0, 95)}`.cyan.bold
  )
  console.log('| 数据库已连接'.green.bold)
  console.log('|---------------------------------------------------')
  console.log(`| 数据库  : ${connection.connection.host}`.cyan.bold)
  console.log(`| 连接日期: ${date}`.cyan.bold)
  console.log('|---------------------------------------------------')
}

module.exports = connectDB
