// import express, { Request, Response, NextFunction } from "express";
// import cors from "cors";

// import helmet from "helmet";
// import s3Routes from "./routes/presignurl.routes";

// import { requestLogger } from "./middleware/logger.middleware";
// import { logger } from "./utils/logger";
// import { env } from "./config/env";

// const app = express();

// // Security middleware
// app.use(helmet());


// // Request Tracking & Logging
// app.use(requestLogger);




// // can be changed if logic changes


// // CORS
// app.use(cors({
//   origin: [  "http://localhost:5173"], // Allowing local dev and prospective production
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// }));


// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));


// // ROUTES
// app.use("/", s3Routes);




// // Health check endpoint
// app.get("/health", (req: Request, res: Response) => {
//   res.status(200).json({
//     status: "healthy",
//     service: "s3-service",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: env.NODE_ENV
//   });
// });


// // 404 handler
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.status(404).json({
//     status: 404,
//     message: "Requested s3-related resource not found",

//   });
// });


// // Global Error handler with Winston
// app.use((err: any, req: any, res: Response, next: NextFunction) => {
//   logger.error("Server error", {
//     requestId: req.id,
//     message: err.message,
//     stack: err.stack,
//   });

//   res.status(err.status || 500).json({
//     success: false,
//     message: "Internal Server Error in Blood Service",
//     error: env.NODE_ENV === "development" ? err : {}, // Still show object in dev, hide details in prod

//   });
// });

// export default app;



import express, {
    Request,
    Response,
    NextFunction,
} from "express";

import cors from "cors";
import helmet from "helmet";
// import cookieParser from "cookie-parser";

import s3Routes from "./routes/presignurl.routes";

import { requestLogger } from "./middleware/logger.middleware";

import { logger } from "./utils/logger";

import { env } from "./config/env";

const app = express();

/**
 * TRUST PROXY
 */
app.set("trust proxy", 1);

/**
 * SECURITY
 */
app.use(helmet());

/**
 * LOGGER
 */
app.use(requestLogger);

/**
 * INTERNAL CORS
 */
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://hostahospital.com",
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
    })
);

/**
 * BODY PARSER
 */
app.use(express.json({ limit: "10mb" }));

app.use(
    express.urlencoded({
        limit: "10mb",
        extended: true,
    })
);

// app.use(cookieParser());

/**
 * ROUTES
 */
app.use("/", s3Routes);

/**
 * HEALTH
 */
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "healthy",
        service: "s3-service",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
    });
});

/**
 * 404
 */
app.use(
    (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        res.status(404).json({
            status: 404,
            message:
                "Requested s3-related resource not found",
        });
    }
);

/**
 * GLOBAL ERROR HANDLER
 */
app.use(
    (
        err: any,
        req: any,
        res: Response,
        next: NextFunction
    ) => {

        logger.error("Server error", {
            requestId: req.id,
            message: err.message,
            stack: err.stack,
        });

        res.status(err.status || 500).json({
            success: false,

            message:
                "Internal Server Error in S3 Service",

            error:
                env.NODE_ENV === "development"
                    ? err
                    : {},
        });
    }
);

export default app;
