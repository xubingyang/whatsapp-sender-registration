// 加载全局所需的模块
const express = require('express')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
require('colors')

// 加载中间件
const morgan = require('morgan')
const errorHandler = require('./middleware/errorHandler')

// 加载route文件
const auth = require('./routes/auth')
const clients = require('./routes/clients')
const senders = require('./routes/senders')
const users = require('./routes/users')

// 启用Express
const app = express()

// 调用Helmet来防止http header污染
app.use(helmet())

// 启用Rate Limiter
const limiter = rateLimit({
  max: process.env.LIMITER_MAX,
  windowMs: process.env.LIMITER_HOUR * 60 * 60 * 1000,
  skipFailedRequests: process.env.LIMITER_SKIP_FAILED_REQUESTS,
  message: {
    error: '来自此IP的请求过多，请1小时候再次尝试访问'
  }
})

// Body Parser中间件
app.use(express.json({ limit: '10kb' }))

// 数据清理 - 针对NoSQL
app.use(mongoSanitize())

// 数据清理 - 针对XSS
app.use(xss())

// 数据清理 - 针对Query String的污染
app.use(
  hpp({
    whitelist: ['name']
  })
)

// Cookie Parser中间件
app.use(cookieParser())

// 限制请求速度
app.use('/api', limiter)

// 启用logger中间件
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// 启用routes
// API
app.use('/api/v1/auth', auth)
app.use('/api/v1/clients', clients)
app.use('/api/v1/senders', senders)
app.use('/api/v1/users', users)

// 启用errorHandler
app.use(errorHandler)

module.exports = app
