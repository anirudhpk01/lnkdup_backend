// const express = require('express');
// const cors = require('cors');
// const { createClient } = require('redis');
// const os = require('os');
// let nanoid; // define it in outer scope

// // Dynamically import nanoid at runtime
// (async () => {
//   const mod = await import('nanoid');
//   nanoid = mod.nanoid;
// })();

// const app = express();
// const port = 3000;

// app.use(cors({ origin: '*' }));
// app.use(express.json());
// //app.use(express.static('public'));

// // const redisClient = createClient({
// //   url: 'redis://redis:6379'
// // });

// const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
// const redisClient = createClient({ url: redisUrl });


// redisClient.on('error', err => console.error('Redis Client Error', err));

// // Ensure Redis client connects properly
// (async () => {
//   try {
//     await redisClient.connect();
//     console.log('✅ Redis client connected successfully');
//   } catch (err) {
//     console.error('❌ Failed to connect to Redis:', err);
//     process.exit(1); // Exit the process if Redis connection fails
//   }
// })();

// // app.get('/', (req, res) => {
// //   res.sendFile(__dirname + '/public/index.html');
// // });

// app.get("/", async (req, res) => {
//   const hostname = os.hostname(); // Add this
//   res.send(`Hello from pod: ${hostname}`);
// });

// app.get("/whoami", (req, res) => {
//   const hostname = os.hostname();
//   res.send(`Hello from pod: ${hostname}`);
// });


// // POST /api/upload
// app.post('/api/upload', async (req, res) => {
//   const { link } = req.body;

//   if (!link) {
//     return res.status(400).json({ error: 'link is required' });
//   }

//   // Wait for nanoid to be ready
//   while (!nanoid) {
//     await new Promise(resolve => setTimeout(resolve, 10));
//   }

//   const existingShort = await redisClient.get(`long:${link}`);
//   if (existingShort) {
//     console.log('✅ Link already shortened:', existingShort);
//     return res.status(200).json({ short_url: existingShort });
//   }

//   const shortId = nanoid(5);
//   await redisClient.set(`short:${shortId}`, link);
//   await redisClient.set(`long:${link}`, shortId);

//   res.status(200).json({ short_url: shortId });
// });

// // GET /:short_url
// app.get('/:short_url', async (req, res) => {
//   const { short_url } = req.params;

//   const longUrl = await redisClient.get(`short:${short_url}`);
//   if (longUrl) {
//     return res.redirect(longUrl);
//   }

//   res.status(404).send('URL not found');
// });

// app.listen(port, '0.0.0.0', () => {
//   console.log(`🚀 App listening at http://0.0.0.0:${port}`);
// });

const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const os = require('os');
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

// Redis connection
const redisClient = createClient({
  url: 'redis://redis:6379'
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

// Normal Routes (e.g., Shortening URLs)
app.post('/api/upload', async (req, res) => {
  const { link } = req.body;

  // Log for demo: which pod and process is handling the request
  console.log(`[${process.env.HOSTNAME}] [PID ${process.pid}] Handling /api/upload request`);

  if (!link) {
    return res.status(400).json({ error: 'link is required' });
  }

  while (!nanoid) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  const existingShort = await redisClient.get(`long:${link}`);
  if (existingShort) {
    console.log(`[${process.env.HOSTNAME}] Returning cached short URL`);
    return res.status(200).json({ short_url: existingShort });
  }

  const shortId = nanoid(5);
  await redisClient.set(`short:${shortId}`, link);
  await redisClient.set(`long:${link}`, shortId);

  console.log(`[${process.env.HOSTNAME}] Created new short URL: ${shortId}`);
  res.status(200).json({ short_url: shortId });
});

app.get('/:short_url', async (req, res) => {
  const { short_url } = req.params;

  const longUrl = await redisClient.get(`short:${short_url}`);
  if (longUrl) {
    return res.redirect(longUrl);
  }

  res.status(404).send('URL not found');
});

app.get("/whoami", (req, res) => {
  const hostname = os.hostname();
  res.send(`Hello from pod: ${hostname}`);
});

// 1. Load Test Route (simulates heavy load processing)
app.get("/api/load-test", async (req, res) => {
  console.log("Simulating heavy load...");

  // Simulate heavy computation or delay to stress the system
  const startTime = Date.now();
  while (Date.now() - startTime < 10000) {  // Keep the server busy for 10 seconds
    // Do some CPU-heavy work (loop to simulate load)
  }

  res.status(200).send('Load test complete. Server was under stress for 10 seconds.');
});

// 2. Metrics Route (Returns basic system metrics)
app.get("/api/metrics", (req, res) => {
  const hostname = os.hostname();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = os.loadavg();

  res.status(200).json({
    hostname: hostname,
    memoryUsage: memoryUsage,
    cpuUsage: cpuUsage,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 App listening at http://0.0.0.0:${port}`);
});

