// 加载全局所需的模块
const express = require('express')
const router = express.Router({ mergeParams: true })
const advancedResults = require('../middleware/advancedResults')
const User = require('../models/User')

// 使用控制器加载routes
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users')

// 使用控制器中间件
const { protect, authorize } = require('../middleware/auth')

// 启用保护器
router.use(protect)
router.use(authorize('admin'))

// 启用控制器
router.route('/').get(advancedResults(User), getUsers).post(createUser)

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = router
