const crypto = require('crypto')
const mongoose = require('mongoose')
const slug = require('limax')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, '请输入姓名']
    },
    username: {
      type: String
    },
    email: {
      type: String,
      required: [true, '请输入邮箱地址'],
      unique: true,
      match: [
        /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,
        '请输入正确的邮箱地址'
      ]
    },
    password: {
      type: String,
      select: false,
      required: [true, '请输入密码'],
      minlength: [6, '密码长度必须6位以上']
    },
    rePassword: {
      type: String,
      select: false,
      required: [true, '请再次输入密码'],
      validate: {
        // 只在create和save的时候才有效
        validator: function (password) {
          return password === this.password
        },
        message: '两次输入的密码不一致'
      }
    },
    phone: {
      type: String,
      maxlength: [20, '号码长度不可以超过20为数字']
    },
    role: {
      type: String,
      enum: ['user', 'client', 'partner', 'admin'],
      default: 'user'
    },
    imageCover: {
      type: String
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// 过滤非活跃用户
UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

// 通过limax来自动创建username
UserSchema.pre('save', async function (next) {
  this.username = await slug(this.name, { tone: false, separateNumbers: true })
  next()
})

// 通过limax来自动更新username
UserSchema.pre('findOneAndUpdate', async function (next) {
  if (this._update.name) {
    this.set({
      username: await slug(this._update.name, {
        tone: false,
        separateNumbers: true
      })
    })
    return next()
  }
  next()
})

// 通过bcrypt来hash密码
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  this.rePassword = undefined
  next()
})

// 自动添加passwordChangedAt属性
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next()
  }
  // 设置passwordChangedAt属性为现在时间
  // 并留10s的数据库处理时间以防以后验证失败
  this.passwordChangedAt = Date.now() - 1000 * 10
  next()
})

// 通过JWT来签名并且返回hash密码
UserSchema.methods.getSignedJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// 确认用户签发JWT后是否有修改密码
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    // JWT时间戳短于修改密码时间的话，返回true
    return JWTTimestamp < changedTimestamp
  }
  return false
}

// 匹配用户密码和数据库中密码是否匹配
UserSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

// 为重置密码创建token
UserSchema.methods.getResetPasswordToken = function () {
  // 生成token
  const resetToken = crypto.randomBytes(10).toString('hex')

  // 加密token并发送
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // 设定Token过期时间
  this.resetPasswordExpire =
    Date.now() + process.env.PASSWORD_EXPIRE_TIME_MINUTE * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', UserSchema)
