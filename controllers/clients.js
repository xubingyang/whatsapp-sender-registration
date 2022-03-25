// 调用Client的Model
const Client = require('../models/Client')
// 调用asyncHandler
const asyncHandler = require('../middleware/async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')
// const { deleteOne } = require('./crud')

// @desc: 展示所有的Clients, 支持select, sort, page, limit四个关键字
// @routes: GET /api/v1/clients
// @access: Public
exports.getClients = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc: 根据id展示单个Client
// @routes: GET /api/v1/clients/:id
// @access: Public
exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id).select('-__v').populate({
    path: 'reviews',
    select: '-owner -__v'
  })
  if (!client) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.params.id} 行程，请检查行程ID`,
        404
      )
    )
  }
  res.status(200).json({
    success: true,
    data: {
      client
    }
  })
})

// @desc: 添加一个新的Client
// @routes: POST /api/v1/clients
// @access: Private
exports.createClient = asyncHandler(async (req, res, next) => {
  // 把创建人id绑定在req.body上
  if (!req.body.owner) req.body.owner = req.user.id

  // 存储内容到数据库
  const client = await Client.create(req.body)
  res.status(201).json({
    success: true,
    data: client
  })
})

// @desc: 根据id更新单个Client
// @routes: PUT /api/v1/clients/:id
// @access: Private
exports.updateClient = asyncHandler(async (req, res, next) => {
  let client = await Client.findById(req.params.id)
  if (!client) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.params.id} 行程，请检查行程ID`,
        404
      )
    )
  }

  // 确认创建Client的用户和修改的用户一致
  if (client.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`此用户 ${req.params.id} 无权修改此行程`, 404)
    )
  }
  // 执行数据库修改
  client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: {
      client
    }
  })
})

// @desc: 根据id删除单个Client
// @routes: DELETE /api/v1/clients/:id
// @access: Private
// exports.deleteClient = deleteOne(Client, '行程');
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id)
  if (!client) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.params.id} 行程，请检查行程ID`,
        404
      )
    )
  }

  // 确认创建Client的用户和删除的用户一致
  if (client.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`ID为 ${req.params.id} 的用户无权删除此行程`, 404)
    )
  }

  // 从数据库删除
  client.remove()

  res.status(204).json({
    success: true,
    data: {
      client: null
    }
  })
})
