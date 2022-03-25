const advancedResults = (model, populate) => async (req, res, next) => {
  // 首先复制request中的query
  const reqQuery = { ...req.query }

  // 如果有select和sort标签则清空query
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach((param) => delete reqQuery[param])

  // 把query字符串化方便处理
  let queryStr = JSON.stringify(reqQuery)

  // 加入mongoose逻辑运算子用于匹配条件
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

  // 按匹配后的条件查找数据库
  let query = model.find(JSON.parse(queryStr))

  // 如果有select标签
  if (req.query.select) {
    // 处理url里的select标签字符串后的','为mongoose可识别的' '
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  } else {
    // 默认去掉 __v 属性
    query = query.select('-__v')
  }

  // 如果有sort标签
  if (req.query.sort) {
    // 处理url里的select标签字符串后的','为mongoose可识别的' '
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    // 默认用时间排序 - 时间降幂排序
    query = query.sort('-createdAt')
  }

  // 可以populate里加入select选项, .populate({path: 'jobs', select: 'name description createdAt ....'})
  if (populate) {
    query = query.populate(populate)
  }

  // 分页
  const page = parseInt(req.query.page, 10) || 1 // 默认是第一页为默认页,每10个分一页
  const limit = parseInt(req.query.limit, 10) || 25 // 默认是只展示25个,每页请求只显示10个
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await model.countDocuments()
  query = query.skip(startIndex).limit(limit)

  // 获取最终结果输出给data
  const results = await query

  // 页码结果
  const pagination = {} // 如果只有一页或者不需要分页的情况下, 输出为空{}
  // 有下一页的情况下
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }
  // 有上一页的情况下
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    total,
    count: results.length,
    pagination,
    data: results
  }

  next()
}

module.exports = advancedResults
