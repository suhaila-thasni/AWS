// import express, { Request, Response } from "express";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import routes from "./routes";
// import { errorHandler } from "./middleware/error.middleware";
// import { env } from "./config/env";
// import { requestLogger } from "./middleware/logger.middleware";

// const app = express();
// app.set("trust proxy", 1);


// // Security middleware
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

// // Request Tracking & Logging
// app.use(requestLogger);

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Reduced from 1000 to production-typical 100
//     message: {
//         success: false,
//         message: "Too many requests from this IP, please try again later.",
//         error: { code: "RATE_LIMIT_EXCEEDED", details: null }
//     }
// });
// app.use(limiter);

// // Specific limit for login attempt through gateway
// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5,
//     message: "Too many login attempts, please try again after 15 minutes."
// });
// app.use("/api/users/login", loginLimiter);
// app.use("/api/ambulance/login", loginLimiter);
// app.use("/api/doctor/login", loginLimiter);
// app.use("/api/staff/login", loginLimiter);



// // // CORS
// // app.use(cors({
// //     origin: ["http://localhost:5173"],
// //     methods: ["GET", "POST", "PUT", "DELETE"],
// //     credentials: true,
// // }));

// app.use(
//     cors({
//         origin: [
//             "http://localhost:5173",
//             "https://hostahospital.com"
//         ],
//         methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//         credentials: true,
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );




// app.use(express.json({ limit: "10mb" }));

// // Health check endpoint
// app.get("/health", (req: Request, res: Response) => {
//     res.status(200).json({
//         status: "healthy",
//         service: "api-gateway",
//         timestamp: new Date().toISOString(),
//         uptime: process.uptime(),
//         environment: env.NODE_ENV
//     });
// });

// // Routes
// app.use("/api", routes);

// // Error Handling
// app.use(errorHandler);

// export default app;



import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import routes from "./routes";

import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import { requestLogger } from "./middleware/logger.middleware";

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
