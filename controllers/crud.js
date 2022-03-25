// 调用asyncHandler
const asyncHandler = require('../middleware/async')
// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse')

exports.deleteOne = (model, name) =>
  asyncHandler(async (req, res, next) => {
    const resource = await model.findById(req.params.id)
    if (!resource) {
      return next(
        new ErrorResponse(
          `数据库中无法找到ID为 ${req.params.id} 的${name}，请检查${name}ID`,
          404
        )
      )
    }

    // 确认创建资源的用户和删除的用户一致
    if (
      resource.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(`ID为 ${req.params.id} 的用户无权删除此${name}`, 401)
      )
    }

    // 从数据库删除
    resource.remove()

    res.status(204).json({
      success: true,
      data: {
        resource: null
      }
    })
  })

exports.updateOne = (model, name, filter = null) =>
  asyncHandler(async (req, res, next) => {
    this.filter = filter
    const verify = await model.findById(req.params.id)
    if (!verify) {
      return next(
        new ErrorResponse(
          `数据库中无法找到ID为 ${req.params.id} 的${name}，请检查${name}ID`,
          404
        )
      )
    }

    // 确认创建资源的用户和更新的用户一致
    if (verify.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`ID为 ${req.params.id} 的用户无权更新此${name}`, 401)
      )
    }
    // 过滤req.body
    let filterBody = req.body
    if (filter && filter === 'user') {
      filterBody = filterObject(req.body, 'name', 'email')
    }
    // 更新
    const resource = await model.findByIdAndUpdate(req.params.id, filterBody, {
      new: true,
      runValidators: true
    })

    res.status(204).json({
      success: true,
      data: resource
    })
  })

exports.getOne = (model, name, populate) =>
  asyncHandler(async (req, res, next) => {
    let resource = await model.findById(req.params.id)
    if (!resource) {
      return next(
        new ErrorResponse(
          `数据库中无法找到ID为 ${req.params.id} 的${name}，请检查${name}ID`,
          404
        )
      )
    }
    if (populate) {
      resource = resource.populate(populate)
    }
    res.status(200).json({
      success: true,
      data: resource
    })
  })

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
