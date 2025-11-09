import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { ValidationError } from "../models/errors";

/**
 * Validation middleware factory
 * Validates request body against a Joi schema
 * 
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      // Format validation errors
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      const errorMessage = details
        .map((d) => `${d.field}: ${d.message}`)
        .join("; ");

      throw new ValidationError(errorMessage);
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};
