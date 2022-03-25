// 加载全局所需的模块
const express = require('express')
const router = express.Router()

// 使用控制器加载routes
const {
  register,
  login,
  getMe,
  deactivateMe,
  deleteMe,
  forgetPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updateAdminPassword
} = require('../controllers/auth')

// 使用控制器中间件
const { protect, authorize } = require('../middleware/auth')

// 启用控制器
router.post('/register', register)
router.post('/login', login)
router.post('/forgetpassword', forgetPassword)
router.patch('/resetpassword/:resettoken', resetPassword)

// 启用保护器
router.use(protect)

router.route('/me').get(getMe).patch(deactivateMe).delete(deleteMe)
router.patch('/update/details', updateDetails)
router.patch('/update/password', updatePassword)
router.patch('/update/admin/password', authorize('admin'), updateAdminPassword)

module.exports = router
