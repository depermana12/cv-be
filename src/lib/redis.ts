import Redis from "ioredis";

class RedisClient {
  private static instance: Redis;

  constructor() {}
  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: "localhost",
        port: 6379,
      });
    }
    return RedisClient.instance;
  }
}

export const redis = RedisClient.getInstance();
