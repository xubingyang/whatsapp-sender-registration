// 加载全局所需的模块
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
require('colors');

// 加载Models
const Tour = require('./models/Tour');
const User = require('./models/User');
const Review = require('./models/Review');

// 加载env参数
dotenv.config({ path: './config/config.env' });

const connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URI.replace(
      '<MONGO_PASSWORD>',
      process.env.MONGO_PASSWORD
    ).replace('<MONGO_COLLECT_NAME>', process.env.MONGO_COLLECT_NAME),
    {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    }
  );
  console.log('数据库连接成功！'.green.inverse);
};

connectDB();

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8')
);
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    await Review.create(reviews);
    console.log('测试数据导入成功！'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('测试数据删除成功！'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
