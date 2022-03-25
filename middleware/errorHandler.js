// 调用ErrorResponse
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  const sendErrorDev = (err, res) => {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || '服务器错误',
      stack: error.stack,
      errorDetails: err,
    });
  };

  const sendErrorProd = (err, res) => {
    if (err.isOperational) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || '服务器错误',
      });
    } else {
      console.error(`Error: ${err}`);
      res.status(500).json({
        success: false,
        error,
      });
    }
  };

  // Mongoose bad ObjectId error
  if (err.name === 'CastError') {
    const message = `目标资源 ${err.value} 格式不正确`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const value = err.errmsg.match(/"(.*?)"/)[1];
    const message = `资源名 ${value} 已经被占用`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose duplicate key error
  if (err.message === 'Cannot convert undefined or null to object') {
    const value = err.errmsg.match(/"(.*?)"/)[1];
    const message = `资源名 ${value} 已经被占用`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(message.join('; '), 400);
  }

  // JWT Validation error
  if (err.name === 'JsonWebTokenError') {
    const message = '用户Token信息不正确，请重新登录';
    error = new ErrorResponse(message, 401);
  }

  // JWT Expiration error
  if (err.name === 'TokenExpiredError') {
    const message = '用户Token已过期，请重新登录';
    error = new ErrorResponse(message, 401);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }

  next();
};

module.exports = errorHandler;
