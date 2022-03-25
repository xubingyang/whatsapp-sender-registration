// 加载全局所需的模块
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
require('colors')

// 加载Models
const User = require('./models/User')

// 加载env参数
dotenv.config({ path: './config/config.env' })

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    ).replace('<MONGO_COLLECT_NAME>', process.env.MONGO_COLLECT_NAME),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  console.log('数据库连接成功！'.green.inverse)
}

connectDB()

const users = JSON.parse(
  fs.readFileSync(path.resolve('__dirname', 'dev-data/data/users.json'))
)

const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false })
    console.log('测试数据导入成功！'.green.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

const deleteData = async () => {
  try {
    await User.deleteMany()
    console.log('测试数据删除成功！'.red.inverse)
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
}
