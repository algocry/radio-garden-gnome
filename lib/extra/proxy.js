const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Regular HTTP request handler
app.all('/proxy', async (req, res) => {
  const targetURL = req.body.target || req.headers['target-url'];
  const requestData = req.body;
  const requestMethod = req.method.toLowerCase();

  try {
    const response = await axios({
      method: requestMethod,
      url: targetURL,
      data: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send(error.message);
    }
  }
});

// HEAD request handler for keeping the server active
app.head('/', (req, res) => {
  res.sendStatus(200);
});

const server = app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

// Keep the server running indefinitely
setInterval(() => {
  server.getConnections((err, count) => {
    if (err) {
      console.error('Error getting server connections:', err);
    } else {
      console.log(`Server connections: ${count}`);
    }
  });
}, 60000);
