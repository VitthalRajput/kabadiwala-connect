// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import materialRouter from "./routes/material.routes.js";
import priceRouter from "./routes/price.routes.js";
import lotRouter from "./routes/lot.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import matchmakingRouter from "./routes/matchmaking.routes.js";
import auditRouter from "./routes/audit.routes.js";
import syncRouter from "./routes/sync.routes.js";
import mlRouter from "./routes/ml.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/prices", priceRouter);
app.use("/api/v1/lots", lotRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/matchmaking", matchmakingRouter);
app.use("/api/v1/audit", auditRouter);
app.use("/api/v1/sync", syncRouter);
app.use("/api/v1/ml", mlRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Kabadiwala Connect API is running",
        version: "1.0.0",
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export { app };