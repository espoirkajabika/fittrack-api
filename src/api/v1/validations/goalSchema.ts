import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - type
 *         - title
 *         - startDate
 *         - deadline
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the goal
 *         userId:
 *           type: string
 *           description: User who created the goal
 *         type:
 *           type: string
 *           enum: [weight, body_fat, strength, workout_frequency, custom]
 *           description: Type of goal
 *         title:
 *           type: string
 *           description: Goal title
 *           example: "Lose 10 pounds"
 *         description:
 *           type: string
 *           description: Detailed description
 *         targetWeight:
 *           type: number
 *           description: Target weight for weight goals
 *         targetBodyFat:
 *           type: number
 *           description: Target body fat percentage
 *         strengthTarget:
 *           type: object
 *           properties:
 *             exerciseId:
 *               type: string
 *             exerciseName:
 *               type: string
 *             targetWeight:
 *               type: number
 *             targetReps:
 *               type: integer
 *         frequencyTarget:
 *           type: object
 *           properties:
 *             workoutsPerWeek:
 *               type: integer
 *             workoutsPerMonth:
 *               type: integer
 *         customTarget:
 *           type: string
 *         startValue:
 *           type: number
 *         currentValue:
 *           type: number
 *         currentProgress:
 *           type: number
 *           description: Progress percentage (0-100)
 *         startDate:
 *           type: string
 *           format: date-time
 *         deadline:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, completed, abandoned, expired]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Joi schema for strength goal target
const strengthTargetSchema = Joi.object({
  exerciseId: Joi.string().required(),
  exerciseName: Joi.string().required(),
  targetWeight: Joi.number().min(0).required(),
  targetReps: Joi.number().integer().min(1).required(),
});

// Joi schema for workout frequency target
const frequencyTargetSchema = Joi.object({
  workoutsPerWeek: Joi.number().integer().min(1).max(30).optional(),
  workoutsPerMonth: Joi.number().integer().min(1).max(120).optional(),
}).or("workoutsPerWeek", "workoutsPerMonth");

// Joi schema for creating a goal
export const createGoalSchema = Joi.object({
  type: Joi.string()
    .valid("weight", "body_fat", "strength", "workout_frequency", "custom")
    .required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  targetWeight: Joi.number().min(0).max(500).optional(),
  targetBodyFat: Joi.number().min(0).max(100).optional(),
  strengthTarget: strengthTargetSchema.optional(),
  frequencyTarget: frequencyTargetSchema.optional(),
  customTarget: Joi.string().max(200).optional(),
  startValue: Joi.number().min(0).optional(),
  deadline: Joi.date().greater("now").required(),
});

// Joi schema for updating a goal
export const updateGoalSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  targetWeight: Joi.number().min(0).max(500).optional(),
  targetBodyFat: Joi.number().min(0).max(100).optional(),
  strengthTarget: strengthTargetSchema.optional(),
  frequencyTarget: frequencyTargetSchema.optional(),
  customTarget: Joi.string().max(200).optional(),
  deadline: Joi.date().optional(),
  status: Joi.string().valid("active", "completed", "abandoned", "expired").optional(),
}).min(1);

// Joi schema for updating goal progress
export const updateGoalProgressSchema = Joi.object({
  currentValue: Joi.number().min(0).optional(),
  currentProgress: Joi.number().min(0).max(100).optional(),
}).min(1);
