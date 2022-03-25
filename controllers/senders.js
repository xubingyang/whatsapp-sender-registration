// 调用Sender的Model
const Sender = require('../models/Sender')
// 调用Client的Model
const Client = require('../models/Client')
// 调用asyncHandler
const asyncHandler = require('../middleware/async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')
// const { deleteOne, getOne } = require('./crud')

// @desc: 展示所有的Senders, 支持select, sort, page, limit四个关键字
// @routes: GET /api/v1/reviews
// @routes: GET /api/v1/clients/:clientId/reviews
// @access: Public
exports.getSenders = asyncHandler(async (req, res, next) => {
  // 把评论的行程id绑定在req.body上
  if (!req.body.client) req.body.client = req.params.clientId
  const client = await Client.findById(req.body.client)
  if (!client) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.body.client} 行程，请检查行程ID`,
        404
      )
    )
  }
  // /api/v1/clients/:clientId/reviews里的clientId在由中间件添加进req.query
  res.status(200).json(res.advancedResults)
})

// @desc: 根据id展示单个Sender
// @routes: GET /api/v1/reviews/:id
// @access: Public
// exports.getSender = getOne(Client, '评论', null);
exports.getSender = asyncHandler(async (req, res, next) => {
  const review = await Sender.findById(req.params.id)
  if (!review) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.params.id} 评论，请检查评论ID`,
        404
      )
    )
  }
  res.status(200).json({
    success: true,
    data: {
      review
    }
  })
})

// @desc: 添加一个新的Sender
// @routes: POST /api/v1/reviews
// @routes: POST /api/v1/clients/:clientId/reviews
// @access: Private
exports.createSender = asyncHandler(async (req, res, next) => {
  // 把评论人id绑定在req.body上
  if (!req.body.owner) req.body.owner = req.user.id
  // 把评论的行程id绑定在req.body上
  if (!req.body.client) req.body.client = req.params.clientId
  const client = await Client.findById(req.body.client)
  if (!client) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.body.client} 行程，请检查行程ID`,
        404
      )
    )
  }
  // 存储内容到数据库
  const review = await Sender.create(req.body)
  res.status(201).json({
    success: true,
    data: review
  })
})

// @desc: 根据id更新单个Sender
// @routes: PUT /api/v1/reviews/:id
// @access: Private
exports.updateSender = asyncHandler(async (req, res, next) => {
  let review = await Sender.findById(req.params.id)
  if (!review) {
    return next(
      new ErrorResponse(
        `数据库中无法找到 ${req.params.id} 评论，请检查评论ID`,
        404
      )
    )
  }

  // 确认创建Sender的用户和修改的用户一致
  if (review.owner.id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`此用户无权修改ID为 ${req.params.id} 的评论`, 404)
    )
  }
  // 执行数据库修改
  review = await Sender.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: {
      review
    }
  })
})

// @desc: 根据id删除单个Sender
// @routes: DELETE /api/v1/reviews/:id
// @access: Private
// exports.deleteSender = deleteOne(Client, '评论');
exports.deleteSender = asyncHandler(async (req, res, next) => {
  const review = await Sender.findById(req.params.id)
  if (!review) {
    return next(
      new ErrorResponse(
        `数据库中无法找到ID为 ${req.params.id} 的评论，请检查评论ID`,
        404
      )
    )
  }

  // 确认创建Sender的用户和删除的用户一致
  if (review.owner.id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`此用户无权修改ID为 ${req.params.id} 的评论`, 404)
    )
  }

  // 从数据库删除
  await Sender.findByIdAndDelete(req.params.id)

  res.status(204).json({
    success: true,
    data: {
      review: null
    }
  })
})
