const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

let nanoid; // placeholder

// Dynamically import nanoid at runtime
(async () => {
  const mod = await import('nanoid');
  nanoid = mod.nanoid;
})();

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static('public'));

const redisClient = createClient({
  url: 'redis://redis:6379' // Docker Compose. Use 'redis://localhost:6379' locally.
});

redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
  

// POST /api/upload
app.post('/api/upload', async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'link is required' });
  }

  // Wait for nanoid to be ready
  while (!nanoid) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  const existingShort = await redisClient.get(`long:${link}`);
  if (existingShort) {
    console.log("Yes, it already exists!")
    return res.status(200).json({ short_url: existingShort });
  }

  const shortId = nanoid(5);
  await redisClient.set(`short:${shortId}`, link);
  await redisClient.set(`long:${link}`, shortId);

  res.status(200).json({ short_url: shortId });
});

// GET /:short_url
app.get('/:short_url', async (req, res) => {
  const { short_url } = req.params;

  const longUrl = await redisClient.get(`short:${short_url}`);
  if (longUrl) {
    return res.redirect(longUrl);
  }

  res.status(404).send('URL not found');
});

app.listen(port, () => {
  console.log(`🚀 App listening at http://localhost:${port}`);
});
