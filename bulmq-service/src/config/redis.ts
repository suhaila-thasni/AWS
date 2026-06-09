// import dotenv from "dotenv";

// dotenv.config();


// const connection = {
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   tls: {}
// };

// export default connection;

import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

export const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});



connection.on("connect", () => {
  console.log("Redis connected ✔️");
});

connection.on("error", (err) => {
  console.error("Redis error ❌", err);
});

async function testRedis() {
  try {
    await connection.set("test_key", "hello");
    const value = await connection.get("test_key");

    console.log("Redis working ✔️ Value =", value);
  } catch (err) {
    console.error("Redis NOT working ❌", err);
  }
}

testRedis();
