// 加载全局所需的模块
const express = require('express')
const router = express.Router({ mergeParams: true })
const advancedResults = require('../middleware/advancedResults')
const Sender = require('../models/Sender')

// 使用控制器加载routes
const {
  getSenders,
  getSender,
  createSender,
  updateSender,
  deleteSender
} = require('../controllers/senders')

// 使用控制器中间件
const { protect, authorize } = require('../middleware/auth')

// 启用控制器
router
  .route('/')
  .get(advancedResults(Sender), getSenders)
  .post(protect, authorize('user'), createSender)
router
  .route('/:id')
  .get(protect, getSender)
  .patch(protect, authorize('admin', 'user'), updateSender)
  .delete(protect, authorize('admin', 'user'), deleteSender)

module.exports = router
