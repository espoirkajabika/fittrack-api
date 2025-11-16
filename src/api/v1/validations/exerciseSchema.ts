import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - category
 *         - muscleGroups
 *         - equipment
 *         - difficulty
 *         - instructions
 *         - createdBy
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the exercise
 *           example: "bench-press"
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Name of the exercise
 *           example: "Barbell Bench Press"
 *         category:
 *           type: string
 *           enum: [strength, cardio, flexibility, balance]
 *           description: Category of the exercise
 *           example: "strength"
 *         muscleGroups:
 *           type: array
 *           items:
 *             type: string
 *           description: Primary muscle groups worked
 *           example: ["chest", "triceps", "shoulders"]
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *           description: Required equipment
 *           example: ["barbell", "bench"]
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level
 *           example: "intermediate"
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: Step-by-step instructions
 *           example: ["Lie flat on bench", "Grip bar slightly wider than shoulders", "Lower bar to chest", "Press back up"]
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL to exercise image
 *           example: "https://example.com/bench-press.jpg"
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL to exercise video
 *           example: "https://youtube.com/watch?v=example"
 *         createdBy:
 *           type: string
 *           description: User ID of trainer/admin who created the exercise
 *           example: "user-789"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the exercise was created
 *           example: "2025-11-09T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the exercise was last updated
 *           example: "2025-11-09T08:00:00Z"
 */

// Common muscle groups
const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "obliques",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "traps",
  "lats",
  "lower back",
];

// Common equipment
const EQUIPMENT = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "resistance band",
  "cable machine",
  "bench",
  "pull-up bar",
  "bodyweight",
  "medicine ball",
  "smith machine",
  "leg press",
  "none",
];

// Joi validation schema for creating an exercise
export const createExerciseSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  category: Joi.string()
    .valid("strength", "cardio", "flexibility", "balance")
    .required(),
  muscleGroups: Joi.array()
    .items(Joi.string().valid(...MUSCLE_GROUPS))
    .min(1)
    .required(),
  equipment: Joi.array()
    .items(Joi.string().valid(...EQUIPMENT))
    .min(1)
    .required(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  instructions: Joi.array().items(Joi.string().min(5).max(500)).min(1).required(),
  imageUrl: Joi.string().uri().optional(),
  videoUrl: Joi.string().uri().optional(),
});

// Joi validation schema for updating an exercise
export const updateExerciseSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  category: Joi.string()
    .valid("strength", "cardio", "flexibility", "balance")
    .optional(),
  muscleGroups: Joi.array()
    .items(Joi.string().valid(...MUSCLE_GROUPS))
    .min(1)
    .optional(),
  equipment: Joi.array()
    .items(Joi.string().valid(...EQUIPMENT))
    .min(1)
    .optional(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),
  instructions: Joi.array().items(Joi.string().min(5).max(500)).min(1).optional(),
  imageUrl: Joi.string().uri().optional().allow(""),
  videoUrl: Joi.string().uri().optional().allow(""),
}).min(1); // At least one field must be provided for update
