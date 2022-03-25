// 加载全局所需的模块
const express = require('express')
const router = express.Router()
const advancedResults = require('../middleware/advancedResults')
const Client = require('../models/Client')
const senders = require('./senders')
const { addClientId } = require('../middleware/nestRoute')

// 使用控制器加载routes
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clients')

// 使用控制器中间件
const { protect, authorize } = require('../middleware/auth')

// sender的nested的路由
router.use('/:clientId/senders', addClientId, senders)

// 启用控制器
router
  .route('/')
  .get(advancedResults(Client), getClients)
  .post(protect, authorize('admin', 'school'), createClient)
router
  .route('/:id')
  .get(getClient)
  .patch(protect, authorize('admin', 'school'), updateClient)
  .delete(protect, authorize('admin', 'school'), deleteClient)

module.exports = router
