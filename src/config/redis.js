const Redis = require("ioredis");
const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = new Redis(url, {
    
    lazyConnect: true,

    maxRetriesPerRequest: 3,

    retryStrategy: (times) => Math.min(times * 200, 2000),

})

redis.on("connect", () => console.log("Redis is Connected!"));
redis.on("error", (err) => console.error("Redis Error: ", err.message));

redis.connect().catch((err) => console.error("Redis initial connection failed: ", err.message));

module.exports = redis;