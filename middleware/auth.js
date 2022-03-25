// 调用promisify
const { promisify } = require('util')
// 调用JWT
const jwt = require('jsonwebtoken')
// 调用asyncHandler
const asyncHandler = require('./async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')
// 调用User的Model
const User = require('../models/User')

exports.protect = asyncHandler(async (req, res, next) => {
  let token
  // 截取header.authorization中的Token信息
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }
  // 验证是否有Token
  if (!token) {
    return next(new ErrorResponse('缺少用户验证信息', 401))
  }
  // 验证Token是否有效
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // 验证用户是否有效
  const currentUser = await User.findById(decoded.id).select(
    '+passwordChangedAt'
  )
  if (!currentUser) {
    return next(new ErrorResponse('找不到此用户数据，请重新登录', 401))
  }
  // 验证用户当前密码是否与签发Token时一致
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new ErrorResponse('用户密码已修改，请重新登录', 401))
  }
  // 通过验证
  req.user = currentUser
  next()
})

// 定义Role可以操作的权限
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`用户角色 ${req.user.role} 权限不足`, 403))
    }
    next()
  }
}
