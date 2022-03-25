// 给/api/v1/client/:clientId/reviews的中间件 加入{ client: req.params.clientId }
exports.addClientId = (req, res, next) => {
  req.query.client = req.params.clientId
  next()
}
