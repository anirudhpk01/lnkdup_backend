const { createClient } = require('redis');

async function showRedisData() {
  const redisClient = createClient({
    url: 'redis://localhost:6379' // or 'redis://redis:6379' if inside Docker
  });

  await redisClient.connect();

  const keys = await redisClient.keys('*');
  for (const key of keys) {
    const value = await redisClient.get(key);
    console.log(`${key} => ${value}`);
  }

  await redisClient.disconnect();
}

showRedisData();
