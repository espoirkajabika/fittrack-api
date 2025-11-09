import { Request, Response, NextFunction } from "express";
import { auth } from "../../../config/firebaseConfig";
import { AuthenticationError } from "../models/errors";

/**
 * Authentication middleware
 * Verifies Firebase JWT token and attaches user info to res.locals
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError(
        "No authentication token provided. Please include a Bearer token in the Authorization header."
      );
    }

    // Get the token (remove "Bearer " prefix)
    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      throw new AuthenticationError("Invalid token format");
    }

    // Verify the token with Firebase
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to res.locals for use in subsequent middleware/controllers
    res.locals.uid = decodedToken.uid;
    res.locals.email = decodedToken.email;
    res.locals.role = decodedToken.role || "user"; // Default role is 'user'

    next();
  } catch (error: any) {
    // Handle Firebase-specific errors
    if (error.code === "auth/id-token-expired") {
      next(new AuthenticationError("Authentication token has expired"));
    } else if (error.code === "auth/argument-error") {
      next(new AuthenticationError("Invalid authentication token"));
    } else if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError("Authentication failed"));
    }
  }
};
