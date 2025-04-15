const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

let nanoid; // define it in outer scope

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
  url: 'redis://redis-service:6379'
});

redisClient.on('error', err => console.error('Redis Client Error', err));

// Ensure Redis client connects properly
(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis client connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to Redis:', err);
    process.exit(1); // Exit the process if Redis connection fails
  }
})();

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
    console.log('✅ Link already shortened:', existingShort);
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

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 App listening at http://0.0.0.0:${port}`);
});
