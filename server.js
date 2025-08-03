const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// ✅ Add this route to avoid 404 on homepage
app.get('/', (req, res) => {
  res.send('✅ OpenPhone webhook server is running.');
});

// Webhook listener
app.post('/webhook', (req, res) => {
  console.log('📩 Webhook received:', req.body);

  // Optional: Add logic to forward this to Monday.com here

  res.status(200).send('Webhook received');
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server listening on port ${port}`);
});
