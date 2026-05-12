import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { env } from "../config/env.js";

export let io: Server;

export const initSocket = async (server: any) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"]
    }
  });

  // Redis Adapter Setup
  const pubClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    username: env.REDIS_USERNAME,
    lazyConnect: true // We will connect manually
  });

  const subClient = pubClient.duplicate();

  pubClient.on("error", (err: Error) => console.error("Redis PubClient Error", err));
  subClient.on("error", (err: Error) => console.error("Redis SubClient Error", err));

  // Explicitly connect
  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Joined room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
