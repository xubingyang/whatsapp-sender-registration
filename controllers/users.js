// 调用User的Model
const User = require('../models/User')
// 调用asyncHandler
const asyncHandler = require('../middleware/async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')

// @desc: 查看所有用户
// @routes: GET /api/v1/users
// @access: Private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc: 注册用户
// @routes: GET /api/v1/users/:id
// @access: Private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(
      new ErrorResponse(
        `数据库中无法找到此用户 ${req.params.id} ，请检查用户ID`,
        404
      )
    )
  }
  res.status(200).json({
    success: true,
    data: {
      user
    }
  })
})

// @desc: 创建用户
// @routes: POST /api/v1/users
// @access: Private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // 存储内容到数据库
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
  user.password = undefined
  res.status(201).json({
    success: true,
    data: {
      user
    }
  })
})

// @desc: 更新用户
// @routes: PATCH /api/v1/users/:id
// @access: Private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id)
  if (!user) {
    return next(
      new ErrorResponse(
        `数据库中无法找到此用户 ${req.params.id} ，请检查用户ID`,
        404
      )
    )
  }
  // 执行数据库修改
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: {
      user
    }
  })
})

// @desc: 删除用户
// @routes: DELETE /api/v1/users/:id
// @access: Private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(
      new ErrorResponse(
        `数据库中无法找到此用户 ${req.params.id} ，请检查用户ID`,
        404
      )
    )
  }
  // 从数据库删除
  user.remove()

  res.status(204).json({
    success: true,
    data: {
      user: null
    }
  })
})
