import Redis from 'ioredis';

const redisUrl = process.env.NEXT_PUBLIC_REDIS_URL || 'redis://localhost:6379';

interface GlobalRedis {
    redis: Redis;
}

const globalForRedis = global as typeof globalThis & GlobalRedis;

export const redis = globalForRedis.redis || new Redis(redisUrl);

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

export default redis;
