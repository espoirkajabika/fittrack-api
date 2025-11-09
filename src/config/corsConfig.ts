import { CorsOptions } from "cors";

/**
 * Get CORS configuration based on environment
 * Development allows all origins for easy testing
 * Production restricts to specified origins
 */
export const getCorsOptions = (): CorsOptions => {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // Allow all origins in development for easy testing
    return {
      origin: true,
      credentials: true,
    };
  }

  // Strict origins in production
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  return {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};
