// server.js

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf } }));

app.post('/webhook', (req, res) => {
  const signature = req.headers['openphone-signature'];
  const rawBody = req.rawBody;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.OPENPHONE_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;
  console.log('Received OpenPhone webhook event:', event);

  // TODO: Handle event and send to Monday.com using MONDAY_API_KEY

  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('OpenPhone webhook is running.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
