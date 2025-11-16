import { Router } from "express";
import { ExerciseController } from "../controllers/exerciseController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateRequest } from "../middleware/validateRequest";
import {
  createExerciseSchema,
  updateExerciseSchema,
} from "../validations/exerciseSchema";

const router = Router();
const exerciseController = new ExerciseController();

/**
 * @openapi
 * /exercises:
 *   post:
 *     summary: Create a new exercise
 *     description: Only trainers, coaches, and admins can create exercises
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - muscleGroups
 *               - equipment
 *               - difficulty
 *               - instructions
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Barbell Bench Press"
 *               category:
 *                 type: string
 *                 enum: [strength, cardio, flexibility, balance]
 *                 example: "strength"
 *               muscleGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["chest", "triceps", "shoulders"]
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["barbell", "bench"]
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "intermediate"
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Lie flat on bench", "Grip bar slightly wider than shoulders"]
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       '201':
 *         description: Exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exercise'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Insufficient permissions
 */
router.post(
  "/",
  authenticate,
  authorize({ hasRole: ["trainer", "coach", "admin"] }),
  validateRequest(createExerciseSchema),
  exerciseController.createExercise.bind(exerciseController)
);

/**
 * @openapi
 * /exercises:
 *   get:
 *     summary: Get all exercises with optional filters
 *     description: All authenticated users can view exercises
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [strength, cardio, flexibility, balance]
 *         description: Filter by category
 *       - name: muscleGroup
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by muscle group
 *       - name: equipment
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by equipment
 *       - name: difficulty
 *         in: query
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search by exercise name
 *     responses:
 *       '200':
 *         description: List of exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exercise'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  exerciseController.getAllExercises.bind(exerciseController)
);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   get:
 *     summary: Get a specific exercise by ID
 *     description: All authenticated users can view exercises
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: exerciseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     responses:
 *       '200':
 *         description: Exercise retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exercise'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Exercise not found
 */
router.get(
  "/:exerciseId",
  authenticate,
  exerciseController.getExerciseById.bind(exerciseController)
);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   put:
 *     summary: Update an exercise
 *     description: Only trainers, coaches, and admins can update exercises
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: exerciseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [strength, cardio, flexibility, balance]
 *               muscleGroups:
 *                 type: array
 *                 items:
 *                   type: string
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Exercise updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Exercise'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Insufficient permissions
 *       '404':
 *         description: Exercise not found
 */
router.put(
  "/:exerciseId",
  authenticate,
  authorize({ hasRole: ["trainer", "coach", "admin"] }),
  validateRequest(updateExerciseSchema),
  exerciseController.updateExercise.bind(exerciseController)
);

/**
 * @openapi
 * /exercises/{exerciseId}:
 *   delete:
 *     summary: Delete an exercise
 *     description: Only admins can delete exercises
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: exerciseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     responses:
 *       '200':
 *         description: Exercise deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Only admins can delete exercises
 *       '404':
 *         description: Exercise not found
 */
router.delete(
  "/:exerciseId",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  exerciseController.deleteExercise.bind(exerciseController)
);

export default router;
