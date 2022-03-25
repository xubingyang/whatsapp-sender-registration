// 加载全局所需的模块
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
require('colors');

// 加载中间件
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

const senders = [
  { phoneNumber: 8613011112222 },
  { phoneNumber: 8613033334444 },
];

app.get('/api/v1/senders', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: senders.length,
    data: {
      senders,
    },
  });
});

app.post('/api/v1/senders', (req, res) => {
  console.log(req.body);
  res.status(200).send(`Success`);
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
