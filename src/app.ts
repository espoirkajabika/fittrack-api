import express, { Express } from "express";
import dotenv from "dotenv";

// Load environment variables BEFORE other imports
dotenv.config();

import cors from "cors";
import { getHelmetConfig } from "./config/helmetConfig";
import { getCorsOptions } from "./config/corsConfig";
import setupSwagger from "./config/swagger";
import errorHandler from "./api/v1/middleware/errorHandler";

const app: Express = express();

// Security middleware
app.use(getHelmetConfig());
app.use(cors(getCorsOptions()));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
setupSwagger(app);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "FitTrack API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes will be added here
// app.use("/api/v1/workouts", workoutRoutes);
// app.use("/api/v1/exercises", exerciseRoutes);
// app.use("/api/v1/workout-plans", workoutPlanRoutes);
// app.use("/api/v1/progress", progressRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "The requested resource was not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
