import { env } from "./env";

const connection = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  username: env.REDIS_USERNAME,
  password: env.REDIS_PASSWORD,
};
console.log(connection);
export default connection;