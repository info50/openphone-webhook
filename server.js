
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const MONDAY_API_URL = 'https://api.monday.com/v2';
const BOARD_ID = process.env.MONDAY_BOARD_ID;
const PHONE_COLUMN = 'lead_phone';

const findItemByPhone = async (phone) => {
  const query = `
    query {
      items_by_column_values(board_id: ${BOARD_ID}, column_id: "${PHONE_COLUMN}", column_value: "${phone}") {
        id
      }
    }
  `;

  const response = await axios.post(MONDAY_API_URL, { query }, {
    headers: {
      Authorization: process.env.MONDAY_API_KEY
    }
  });

  const items = response.data.data.items_by_column_values;
  return items.length > 0 ? items[0].id : null;
};

const logCallActivity = async (itemId, details) => {
  const mutation = `
    mutation {
      create_activity_log(item_id: ${itemId}, activity: {
        text: "${details}",
        type: call
      }) {
        id
      }
    }
  `;

  await axios.post(MONDAY_API_URL, { query: mutation }, {
    headers: {
      Authorization: process.env.MONDAY_API_KEY
    }
  });
};

app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    const phoneNumber = data.contact?.phone_number?.replace(/\D/g, '');
    const direction = data.direction;
    const duration = data.duration ? `${Math.round(data.duration)} sec` : 'Unknown';
    const timestamp = new Date(data.created_at).toLocaleString();
    const recordingUrl = data.recording_url;

    if (!phoneNumber) return res.status(400).send('No phone number provided');

    const itemId = await findItemByPhone(phoneNumber);
    if (!itemId) return res.status(404).send('Item not found');

    const message = `📞 **${direction.toUpperCase()} CALL**  
- Phone: ${phoneNumber}  
- Time: ${timestamp}  
- Duration: ${duration}  
${recordingUrl ? `- [🎧 Recording](${recordingUrl})` : ''}`;

    await logCallActivity(itemId, message);

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.response?.data || err.message);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
