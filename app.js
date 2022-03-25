const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res
    .status(200)
    .json({
      result: 'Homepage route GET',
      app: 'WhatsApp-Sender-Registration',
    });
});

app.post('/', (req, res) => {
  res
    .status(200)
    .json({
      result: 'Homepage route POST',
      app: 'WhatsApp-Sender-Registration',
    });
});
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
