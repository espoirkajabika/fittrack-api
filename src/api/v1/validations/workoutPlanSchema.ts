import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     PlanWorkout:
 *       type: object
 *       required:
 *         - weekNumber
 *         - dayOfWeek
 *         - name
 *         - exercises
 *       properties:
 *         weekNumber:
 *           type: integer
 *           minimum: 1
 *           description: Week number in the plan
 *           example: 1
 *         dayOfWeek:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *           description: Day of week (0=Sunday, 1=Monday, etc.)
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the workout
 *           example: "Upper Body Strength"
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WorkoutExercise'
 *           description: List of exercises in this workout
 *         notes:
 *           type: string
 *           description: Optional notes for this workout
 *           example: "Focus on form over weight"
 *     
 *     WorkoutPlan:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - duration
 *         - difficulty
 *         - workouts
 *         - createdBy
 *         - isPublic
 *         - enrolledCount
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the workout plan
 *           example: "plan-123"
 *         name:
 *           type: string
 *           description: Name of the workout plan
 *           example: "6-Week Beginner Program"
 *         description:
 *           type: string
 *           description: Detailed description of the plan
 *           example: "A comprehensive 6-week program designed for beginners"
 *         duration:
 *           type: integer
 *           minimum: 1
 *           description: Duration of the plan in weeks
 *           example: 6
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level
 *           example: "beginner"
 *         workouts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlanWorkout'
 *           description: List of workouts in the plan
 *         createdBy:
 *           type: string
 *           description: User ID of trainer/admin who created the plan
 *           example: "trainer-456"
 *         isPublic:
 *           type: boolean
 *           description: Whether the plan is visible to all users
 *           example: true
 *         enrolledCount:
 *           type: integer
 *           description: Number of users enrolled in this plan
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the plan was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the plan was last updated
 */

// Joi validation schema for workout exercise (reuse from workout schema)
const workoutExerciseSchema = Joi.object({
  exerciseId: Joi.string().required(),
  sets: Joi.number().integer().min(1).max(20).required(),
  reps: Joi.number().integer().min(1).max(100).required(),
  weight: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional(),
});

// Joi validation schema for plan workout
const planWorkoutSchema = Joi.object({
  weekNumber: Joi.number().integer().min(1).required(),
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  name: Joi.string().min(3).max(100).required(),
  exercises: Joi.array().items(workoutExerciseSchema).min(1).required(),
  notes: Joi.string().max(1000).optional(),
});

// Joi validation schema for creating a workout plan
export const createWorkoutPlanSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  duration: Joi.number().integer().min(1).max(52).required(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  workouts: Joi.array().items(planWorkoutSchema).min(1).required(),
  isPublic: Joi.boolean().optional().default(true),
});

// Joi validation schema for updating a workout plan
export const updateWorkoutPlanSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  duration: Joi.number().integer().min(1).max(52).optional(),
  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional(),
  workouts: Joi.array().items(planWorkoutSchema).min(1).optional(),
  isPublic: Joi.boolean().optional(),
}).min(1); // At least one field must be provided for update
