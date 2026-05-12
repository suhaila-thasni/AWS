// import express from "express";
// import cors from "cors";
// import { io } from "./socket/socket.js";

// const app = express();

// app.use(cors());

// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     service: "socket-service"
//   });
// });

// app.get("/test", (req, res) => {
//   if (io) {
//     io.emit("test-event", {
//       message: "Socket working"
//     });
//     res.send("Event emitted");
//   } else {
//     res.status(503).send("Socket server not initialized yet");
//   }
// });

// export default app;






import express from "express";
import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";

import { io } from "./socket/socket.js";

const app = express();

/**
 * TRUST PROXY
 */
app.set("trust proxy", 1);

/**
 * SECURITY
 */
// app.use(helmet());

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
 * HEALTH
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "socket-service",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});

/**
 * SOCKET TEST
 */
app.get("/test", (req, res) => {

    if (io) {

        io.emit("test-event", {
            message: "Socket working",
        });

        return res.status(200).json({
            success: true,
            message: "Socket event emitted successfully",
        });
    }

    return res.status(503).json({
        success: false,
        message: "Socket server not initialized yet",
    });
});

/**
 * 404
 */
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        message:
            "Requested socket-related resource not found",
    });
});

/**
 * GLOBAL ERROR HANDLER
 */
app.use((err: any, req: any, res: any, next: any) => {

    console.error("Socket Service Error:", {
        message: err.message,
        stack: err.stack,
    });

    res.status(err.status || 500).json({
        success: false,

        message:
            "Internal Server Error in Socket Service",

        error:
            process.env.NODE_ENV === "development"
                ? err
                : {},
    });
});

export default app;