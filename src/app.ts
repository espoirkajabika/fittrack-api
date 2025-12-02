import express, { Express } from "express";
import dotenv from "dotenv";

// Load environment variables BEFORE other imports
dotenv.config();

import cors from "cors";
import { getHelmetConfig } from "./config/helmetConfig";
import { getCorsOptions } from "./config/corsConfig";
import setupSwagger from "./config/swagger";
import errorHandler from "./api/v1/middleware/errorHandler";
import workoutRoutes from "./api/v1/routes/workoutRoutes";
import exerciseRoutes from "./api/v1/routes/exerciseRoutes";
import workoutPlanRoutes from "./api/v1/routes/workoutPlanRoutes";
import progressRoutes from "./api/v1/routes/progressRoutes";
import goalRoutes from "./api/v1/routes/goalRoutes";
import jobRoutes from "./api/v1/routes/jobRoutes";
import { auth } from "./config/firebaseConfig";  // ADD THIS

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
    status: true,
  });
});

// API Routes
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/exercises", exerciseRoutes);
app.use("/api/v1/workout-plans", workoutPlanRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/goals", goalRoutes);
app.use("/api/v1/jobs", jobRoutes);

// TEMPORARY: Admin setup route (remove in production!)
app.post("/api/v1/setup/set-role", async (req, res): Promise<void> => {
  try {
    const { email, role, secretKey } = req.body;
    
    // Simple protection - use a secret key
    if (secretKey !== "fittrack-setup-2024") {
      res.status(403).json({ error: "Invalid secret key" });
      return;
    }
    
    const validRoles = ["user", "trainer", "coach", "admin"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: `Invalid role. Use: ${validRoles.join(", ")}` });
      return;
    }
    
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { role });
    
    res.json({ 
      success: true, 
      message: `Role "${role}" set for ${email}. User must get a new token.` 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

// 404 handler (must be after all routes)
app.use((_req, res): void => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "The requested resource was not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
