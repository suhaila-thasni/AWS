import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "socket-service"
  });
});

export default app;
