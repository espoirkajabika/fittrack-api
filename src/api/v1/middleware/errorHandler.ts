import { Request, Response, NextFunction } from "express";
import { AppError } from "../models/errors";

/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Check if it's our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};

export default errorHandler;
