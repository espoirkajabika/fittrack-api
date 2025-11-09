import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     WorkoutExercise:
 *       type: object
 *       required:
 *         - exerciseId
 *         - sets
 *         - reps
 *       properties:
 *         exerciseId:
 *           type: string
 *           description: ID of the exercise
 *           example: "bench-press"
 *         sets:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of sets
 *           example: 3
 *         reps:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Number of repetitions per set
 *           example: 10
 *         weight:
 *           type: number
 *           minimum: 0
 *           description: Weight used in pounds
 *           example: 135
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Additional notes about this exercise
 *           example: "Felt strong on last set"
 *     
 *     Workout:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - name
 *         - scheduledDate
 *         - status
 *         - exercises
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the workout
 *           example: "workout-123"
 *         userId:
 *           type: string
 *           description: ID of the user who owns this workout
 *           example: "user-456"
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Name of the workout
 *           example: "Chest & Triceps Day"
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           description: When the workout is scheduled
 *           example: "2025-11-10T10:00:00Z"
 *         status:
 *           type: string
 *           enum: [scheduled, completed, skipped]
 *           description: Current status of the workout
 *           example: "completed"
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WorkoutExercise'
 *           minItems: 1
 *           description: List of exercises in this workout
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: General notes about the workout
 *           example: "Felt strong today, increased weight on bench press"
 *         duration:
 *           type: integer
 *           minimum: 1
 *           maximum: 300
 *           description: Workout duration in minutes
 *           example: 45
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the workout was created
 *           example: "2025-11-09T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the workout was last updated
 *           example: "2025-11-10T15:30:00Z"
 */

// Joi validation schema for workout exercise
const workoutExerciseSchema = Joi.object({
  exerciseId: Joi.string().required(),
  sets: Joi.number().integer().min(1).max(20).required(),
  reps: Joi.number().integer().min(1).max(100).required(),
  weight: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional(),
});

// Joi validation schema for creating a workout
export const createWorkoutSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  scheduledDate: Joi.date().iso().required(),
  exercises: Joi.array().items(workoutExerciseSchema).min(1).required(),
  notes: Joi.string().max(1000).optional(),
});

// Joi validation schema for updating a workout
export const updateWorkoutSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  scheduledDate: Joi.date().iso().optional(),
  status: Joi.string().valid("scheduled", "completed", "skipped").optional(),
  exercises: Joi.array().items(workoutExerciseSchema).min(1).optional(),
  notes: Joi.string().max(1000).optional(),
  duration: Joi.number().integer().min(1).max(300).optional(),
}).min(1); // At least one field must be provided for update

