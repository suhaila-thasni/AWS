import http from "http";
import app from "./app";
import { initSocket } from "./socket";

const PORT = 3020;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Socket service running on ${PORT}`);
});
