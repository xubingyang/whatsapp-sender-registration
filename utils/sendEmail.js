// 调用 ErrorResponse
const ErrorResponse = require('./errorResponse');
// 加载 mailgun 模块
const sendEmail = (options) => {
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });

  const messageData = {
    from: `${process.env.FROM_NAME}<${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  client.messages
    .create(process.env.MAILGUN_DOMAIN, messageData)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      const error = new ErrorResponse(`邮件发送发生错误 ${err}`, 500);
      console.log(error);
    });
};

module.exports = sendEmail;
