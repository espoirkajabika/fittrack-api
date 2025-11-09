import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "../models/errors";

/**
 * Authorization options interface
 */
interface AuthorizeOptions {
  hasRole?: string[];
  allowSelf?: boolean;
}

/**
 * Authorization middleware factory
 * Creates middleware that checks if user has required permissions
 * 
 * @param options - Authorization options
 * @param options.hasRole - Array of allowed roles
 * @param options.allowSelf - Whether to allow access to own resources
 * @returns Express middleware function
 */
export const authorize = (options: AuthorizeOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userRole = res.locals.role;
      const userId = res.locals.uid;

      // Check role-based authorization
      if (options.hasRole && options.hasRole.length > 0) {
        if (!options.hasRole.includes(userRole)) {
          throw new AuthorizationError(
            `Access denied. Required role: ${options.hasRole.join(" or ")}`
          );
        }
      }

      // Check self-access authorization (e.g., user accessing their own data)
      if (options.allowSelf) {
        const resourceUserId = req.params.userId || req.body.userId;
        
        // Allow if user is accessing their own resource OR has required role
        const isSelf = resourceUserId && resourceUserId === userId;
        const hasRequiredRole = options.hasRole && options.hasRole.includes(userRole);
        
        if (!isSelf && !hasRequiredRole) {
          throw new AuthorizationError(
            "Access denied. You can only access your own resources."
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
