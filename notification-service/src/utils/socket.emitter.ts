import { Emitter } from "@socket.io/redis-emitter";
import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || "",
  username: process.env.REDIS_USERNAME || "default",
});

export const socketEmitter = new Emitter(redisClient);
