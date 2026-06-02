

import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import routes from "./routes";

import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger.middleware";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

/**
 * TRUST PROXY
 */
app.set("trust proxy", 1);

/**
 * SECURITY
 */
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

/**
 * LOGGER
 */
app.use(requestLogger);

/**
 * BODY PARSER
 */
app.use(express.json({ limit: "10mb" }));

/**
 * GENERAL API LIMITER
 * Mild protection against spam / DDoS
 */
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10000,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,

        message:
            "Too many requests from this IP, please try again later.",

        error: {
            code: "RATE_LIMIT_EXCEEDED",
            details: null,
        },
    },
});

/**
 * APPLY GENERAL LIMITER
 */
app.use("/api", limiter);

/**
 * PROFESSIONAL LOGIN LIMITER
 * Based on:
 * IP + Email
 */
const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    standardHeaders: true,

    legacyHeaders: false,

    /**
     * KEY GENERATOR
     * Creates unique key per:
     * IP + Email
     */
    keyGenerator: (req: any) => {

        const email =
            req.body?.email ||
            req.body?.phone ||
            "unknown";

        return `${req.ip}-${email}`;
    },

    message: {
        success: false,

        message:
            "Too many login attempts. Please try again after 15 minutes.",

        error: {
            code: "LOGIN_RATE_LIMIT_EXCEEDED",
            details: null,
        },
    },
});

/**
 * LOGIN ROUTES
 */
app.use("/api/users/login", loginLimiter);

app.use("/api/ambulance/login", loginLimiter);

app.use("/api/doctor/login", loginLimiter);

app.use("/api/staff/login", loginLimiter);

app.use("/api/hospital/login", loginLimiter);




app.post("/api/login", async (req, res) => {
  const payload = req.body;

  const services = [
    `${process.env.HOSPITAL_SERVICE_URL}/hospital/login`,
    `${process.env.DOCTOR_SERVICE_URL}/doctor/login`,
    `${process.env.STAFF_SERVICE_URL}/staff/login`,
  ];

  for (const url of services) {
    try {
      const response = await axios.post(url, payload);

      // IMPORTANT: check service success
      if (response.data?.success) {
        return res.status(200).json({
          success: true,
          roleDetected: url,
          token: response.data.token,
          data: response.data.data,
        });
      }
    } catch (err) {
      // ignore and try next service
    }
  }

  return res.status(401).json({
    success: false,
    message: "Invalid credentials in all services",
  });
});



/**
 * CORS
 */
app.use(
    cors({
        origin: [
            "http://localhost:5173",

            "https://hostahospital.com",

            "https://www.hostahospital.com",
        ],

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS",
        ],

        credentials: true,

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

/**
 * HEALTH CHECK
 */
app.get("/health", (req: Request, res: Response) => {

    res.status(200).json({
        status: "healthy",

        service: "api-gateway",

        timestamp: new Date().toISOString(),

        uptime: process.uptime(),

        environment: env.NODE_ENV,
    });
});

/**
 * ROUTES
 */
app.use("/api", routes);

/**
 * ERROR HANDLER
 */
app.use(errorHandler);

export default app;
