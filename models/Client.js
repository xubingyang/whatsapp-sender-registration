const mongoose = require('mongoose')
const slug = require('limax')
const Sender = require('./Sender')

const ClientSchema = new mongoose.Schema(
  {
    // Business Name on Facebook Business Manager
    businessName: {
      type: String,
      trim: true,
      required: [
        true,
        '请输入贵司的 Facebook Business Manager 上的 Business Name'
      ]
    },
    slug: {
      type: String
    },
    // Facebook Business Manager ID
    businessManagerId: {
      type: Number,
      unique: true,
      required: [true, '请输入贵司的 Facebook Business Manager ID']
    },
    // WhatsApp Display Name
    displayName: {
      type: String,
      trim: true,
      required: [true, '请输入贵司想使用的 WhatsApp Display Name']
    },
    // Client logo (min 300x300 px) – square proportions
    logo: {
      type: String,
      required: [true, '请添加贵司的 Logo']
    },
    // Short client description (up to 130 characters)
    description: {
      type: String,
      trim: true,
      maxlength: [130, '介绍信息最长只能130个字母'],
      required: [true, '请添加介绍信息']
    },
    // Client Website (URL)
    url: {
      type: String,
      required: [true, '请添加贵司的网址']
    },
    // Client Address
    address: {
      type: String,
      required: [true, '请添加贵司的地址']
    },
    // Client Contact email – email to which customers can reach out
    email: {
      type: String,
      required: [true, '请添加贵司的联系邮箱地址'],
      unique: true,
      match: [
        /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,
        '请添加正确的邮箱地址'
      ]
    },
    // Link to Facebook Page, if available
    facebookPageUrl: {
      type: String
    },
    // WhatsApp Sender Number
    phone: {
      type: String,
      validate: {
        validator: function (sender) {
          return /^861([3-9])[0-9]{9}|86[0-9]{10,11}$/.test(sender)
        },
        message:
          '请按照 E.164 标准填写正确的手机号码。例: 8613066668888，861088886666'
      },
      required: [true, '请输入贵司的联系电话号码']
    },
    // https://developers.facebook.com/docs/whatsapp/guides/phone-number#migrate
    numberCheck: {
      type: Boolean,
      required: [true, '请确认填写的手机号并非个人 WhatsApp 用户手机号']
    },
    // URL (end-point) to which incoming messages will be forwarded
    inboundMessageWebhookUrl: {
      type: String
    },
    //   URL (end-point) for receiving Delivery & Seen Reports
    deliveryReportWebhookUrl: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    onboardDate: {
      type: Date
    },
    partnerLevel: {
      type: String,
      enum: ['referral', 'silver', 'gold', 'platinum'],
      default: 'referral'
    },
    secretClient: {
      type: Boolean,
      default: false
    },
    senders: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Sender',
        required: [true, '请添加手机号码']
      }
    ],
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '请添加Infobip合作伙伴负责人']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual populate Senders
ClientSchema.virtual('senders', {
  ref: 'Sender',
  foreignField: 'client',
  localField: '_id'
})

// 设定常用index
ClientSchema.index({ slug: 1 })
ClientSchema.index({ price: 1 })
ClientSchema.index({ price: 1, ratingAverage: -1 })

// 通过limax来自动创建slug
ClientSchema.pre('save', function (next) {
  this.slug = slug(this.name, { tone: false })
  next()
})

// // 自动调用手机号码信息
ClientSchema.pre('save', async function (next) {
  const sendersPromises = this.senders.map(
    async (id) => await Sender.findById(id)
  )
  this.senders = await Promise.all(sendersPromises)
  next()
})

// 过滤掉不需要的Query
// /^find/ = find || findOne || findById  || findByIdAndUpdate || findByIdAndRemove
ClientSchema.pre(/^find/, function (next) {
  this.find({ secretClient: { $ne: true } })
  next()
})

// populate owner 和 senders
ClientSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'senders owner',
    select: process.env.TOUR_POPULATE_SELECT
  })
  next()
})

module.exports = mongoose.model('Client', ClientSchema)
