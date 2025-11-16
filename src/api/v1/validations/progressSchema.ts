import Joi from "joi";

/**
 * @openapi
 * components:
 *   schemas:
 *     ExerciseProgress:
 *       type: object
 *       required:
 *         - exerciseId
 *         - plannedSets
 *         - completedSets
 *         - plannedReps
 *         - actualReps
 *         - actualWeight
 *       properties:
 *         exerciseId:
 *           type: string
 *           description: ID of the exercise
 *         exerciseName:
 *           type: string
 *           description: Name of the exercise (optional, denormalized)
 *         plannedSets:
 *           type: integer
 *           minimum: 1
 *           description: Number of sets planned
 *         completedSets:
 *           type: integer
 *           minimum: 0
 *           description: Number of sets actually completed
 *         plannedReps:
 *           type: integer
 *           minimum: 1
 *           description: Number of reps planned per set
 *         actualReps:
 *           type: array
 *           items:
 *             type: integer
 *           description: Actual reps completed in each set
 *         plannedWeight:
 *           type: number
 *           description: Planned weight
 *         actualWeight:
 *           type: array
 *           items:
 *             type: number
 *           description: Actual weight used in each set
 *         notes:
 *           type: string
 *           description: Notes about this exercise
 *
 *     WorkoutProgress:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - workoutId
 *         - completedAt
 *         - duration
 *         - exercises
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         workoutId:
 *           type: string
 *         workoutName:
 *           type: string
 *         completedAt:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExerciseProgress'
 *         overallNotes:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     BodyMetrics:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - date
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         weight:
 *           type: number
 *           description: Weight in kg or lbs
 *         bodyFat:
 *           type: number
 *           description: Body fat percentage
 *         measurements:
 *           type: object
 *           properties:
 *             chest:
 *               type: number
 *             waist:
 *               type: number
 *             hips:
 *               type: number
 *             thighs:
 *               type: number
 *             arms:
 *               type: number
 *             neck:
 *               type: number
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Joi schema for exercise progress
const exerciseProgressSchema = Joi.object({
  exerciseId: Joi.string().required(),
  exerciseName: Joi.string().optional(),
  plannedSets: Joi.number().integer().min(1).required(),
  completedSets: Joi.number().integer().min(0).required(),
  plannedReps: Joi.number().integer().min(1).required(),
  actualReps: Joi.array().items(Joi.number().integer().min(0)).required(),
  plannedWeight: Joi.number().min(0).optional(),
  actualWeight: Joi.array().items(Joi.number().min(0)).required(),
  notes: Joi.string().max(500).optional(),
});

// Joi schema for completing a workout
export const completeWorkoutSchema = Joi.object({
  duration: Joi.number().integer().min(1).max(600).required(),
  exercises: Joi.array().items(exerciseProgressSchema).min(1).required(),
  overallNotes: Joi.string().max(1000).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
});

// Joi schema for creating body metrics
export const createBodyMetricsSchema = Joi.object({
  date: Joi.date().optional(),
  weight: Joi.number().min(0).max(500).optional(),
  bodyFat: Joi.number().min(0).max(100).optional(),
  measurements: Joi.object({
    chest: Joi.number().min(0).max(200).optional(),
    waist: Joi.number().min(0).max(200).optional(),
    hips: Joi.number().min(0).max(200).optional(),
    thighs: Joi.number().min(0).max(200).optional(),
    arms: Joi.number().min(0).max(200).optional(),
    neck: Joi.number().min(0).max(200).optional(),
  }).optional(),
  notes: Joi.string().max(500).optional(),
}).min(1); // At least one field must be provided

// Joi schema for updating body metrics
export const updateBodyMetricsSchema = Joi.object({
  weight: Joi.number().min(0).max(500).optional(),
  bodyFat: Joi.number().min(0).max(100).optional(),
  measurements: Joi.object({
    chest: Joi.number().min(0).max(200).optional(),
    waist: Joi.number().min(0).max(200).optional(),
    hips: Joi.number().min(0).max(200).optional(),
    thighs: Joi.number().min(0).max(200).optional(),
    arms: Joi.number().min(0).max(200).optional(),
    neck: Joi.number().min(0).max(200).optional(),
  }).optional(),
  notes: Joi.string().max(500).optional(),
}).min(1); // At least one field must be provided
