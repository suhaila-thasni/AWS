// "use strict";
// var __importDefault = (this && this.__importDefault) || function (mod) {
//     return (mod && mod.__esModule) ? mod : { "default": mod };
// };
// Object.defineProperty(exports, "__esModule", { value: true });
// const express_1 = __importDefault(require("express"));
// const http_proxy_middleware_1 = require("http-proxy-middleware");
// const cors_1 = __importDefault(require("cors"));
// const app = (0, express_1.default)();
// app.use((0, cors_1.default)());
// app.use(express_1.default.json());
// // Helper for proxy routes
// const createProxy = (target) => (0, http_proxy_middleware_1.createProxyMiddleware)({
//     target: target,
//     changeOrigin: true,
//     logger: console
// });
// // ROUTES
// app.use("/ambulance", createProxy("http://ambulance-service:3001"));
// app.use("/doctor", createProxy("http://doctor-service:3004"));
// app.use("/staff", createProxy("http://staff-service:3006"));
// app.use("/hospital", createProxy("http://hospital-service:3009"));
// app.use("/booking", createProxy("http://booking-service:3010"));
// app.use("/prescription", createProxy("http://user-service:3009"));



// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`🚀 API Gateway running on port ${PORT}`);
// });



"use strict";

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();

/**
 * CORS Configuration
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hostahospital.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/**
 * Helper for proxy routes
 */
const createProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    logger: console,

    onError: (err, req, res: any) => {
      console.error("Proxy Error:", err.message);

      res.status(500).json({
        success: false,
        message: "Service unavailable",
      });
    },
  });

/**
 * ROUTES
 */

app.use(
  "/ambulance",
  createProxy("http://ambulance-service:3001")
);

app.use(
  "/doctor",
  createProxy("http://doctor-service:3004")
);

app.use(
  "/staff",
  createProxy("http://staff-service:3006")
);

app.use(
  "/hospital",
  createProxy("http://hospital-service:3009")
);

app.use(
  "/booking",
  createProxy("http://booking-service:3010")
);

app.use(
  "/prescription",
  createProxy("http://user-service:3009")
);

/**
 * Health Check Route
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway Running",
  });
});

/**
 * Start Server
 */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
