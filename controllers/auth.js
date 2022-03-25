const crypto = require('crypto')
// 调用User的Model
const User = require('../models/User')
// 调用asyncHandler
const asyncHandler = require('../middleware/async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')
// 调用sendEmail
const sendEmail = require('../utils/sendEmail')

// @desc: 注册用户
// @routes: POST /api/v1/auth/register
// @access: Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body
  const isNameRegistered = await User.findOne({ name })
  const isEmailRegistered = await User.findOne({ email })

  if (isEmailRegistered) {
    return next(new ErrorResponse('此邮箱已注册', 400))
  }

  if (isNameRegistered) {
    return next(new ErrorResponse('此用户名已注册', 400))
  }
  const user = await User.create(req.body)
  sendTokenResponse(user, 201, res)
})

// @desc: 用户登录
// @routes: POST /api/v1/auth/login
// @access: Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  // 验证是否输入email
  if (!email) {
    return next(new ErrorResponse('请输入邮箱', 400))
  }

  // 验证是否输入密码
  if (!password) {
    return next(new ErrorResponse('请输入密码', 400))
  }

  // 验证用户是否存在
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return next(new ErrorResponse('用户不存在', 401))
  }

  // 验证密码是否正确
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    return next(new ErrorResponse('密码不正确', 401))
  }

  sendTokenResponse(user, 200, res)
})

// @desc: 获取当前用户
// @routes: POST /api/v1/auth/me
// @access: Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    user
  })
})

// @desc: 停用当前用户
// @routes: PATCH /api/v1/auth/me
// @access: Private
exports.deactivateMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    success: true,
    user: {}
  })
})

// @desc: 删除当前用户
// @routes: DELETE /api/v1/auth/me
// @access: Private
exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id)

  res.status(204).json({
    success: true,
    user: {}
  })
})

// @desc: 更新用户信息
// @routes: PATCH /api/v1/auth/update/details
// @access: PrivateD
exports.updateDetails = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.rePassword) {
    return next(
      new ErrorResponse('此链接不可用于密码修改，请使用密码修改链接', 400)
    )
  }

  const filterBody = filterObject(req.body, 'name', 'email')
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    user
  })
})

// @desc: 更新用户密码
// @routes: PATCH /api/v1/auth/update/password
// @access: Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('当前密码不正确', 401))
  }
  user.password = req.body.newPassword
  user.rePassword = req.body.reNewPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc: 更新管理员密码
// @routes: PATCH /api/v1/auth/update/admin/password
// @access: Private
exports.updateAdminPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('当前密码不正确', 401))
  }
  user.password = req.body.newPassword
  user.rePassword = req.body.reNewPassword
  await user.save({ validateBeforeSave: false })

  sendTokenResponse(user, 200, res)
})

// @desc: 忘记密码
// @routes: POST /api/v1/auth/forgetpassword
// @access: Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 检验是否此email注册的用户
  if (!req.body.email) {
    return next(new ErrorResponse('请输入电子邮箱地址', 400))
  }

  const user = await User.findOne({ email: req.body.email })

  // 检验是否此email注册的用户
  if (!user) {
    return next(
      new ErrorResponse(`数据库中找不到此用户 ${req.body.email}`, 404)
    )
  }

  // 获取重置密码所需的Token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  const resetTokenLink = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`

  // 发邮件
  try {
    await sendEmail({
      email: user.email,
      subject: '重置密码',
      template: process.env.MAILGUN_FORGET_PASSWORD_TEMPLATE,
      resetTokenLink
    })
    res.status(200).json({
      success: true,
      message: '重置密码邮件已发送'
    })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return next(new ErrorResponse('邮件无法发送', 500))
  }
})

// @desc: 重置用户密码
// @routes: PATCH /api/v1/auth/resetpassword/:resettoken
// @access: Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  })

  // 检查是否Token是否正确或是否已过期
  if (!user) {
    return next(new ErrorResponse('链接地址错误或已过期', 400))
  }

  user.password = req.body.password
  user.rePassword = req.body.rePassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendTokenResponse(user, 200, res)
})

// 从Model中获取Token, 然后创建cookie再返回
const sendTokenResponse = (user, statusCode, res) => {
  // 创建Token
  const token = user.getSignedJsonWebToken()

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_HOUR * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  user.password = undefined

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user
  })
}

// 过滤req.body
const filterObject = (object, ...allowedFields) => {
  const newObject = {}
  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) {
      newObject[element] = object[element]
    }
  })
  return newObject
}
