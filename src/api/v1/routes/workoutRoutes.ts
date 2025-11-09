import { Router } from "express";
import { WorkoutController } from "../controllers/workoutController";
import { authenticate } from "../middleware/authenticate";
import { validateRequest } from "../middleware/validateRequest";
import { createWorkoutSchema, updateWorkoutSchema } from "../validations/workoutSchema";

const router = Router();
const workoutController = new WorkoutController();

/**
 * @openapi
 * /workouts:
 *   post:
 *     summary: Create a new workout
 *     tags: [Workouts]
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
 *               - scheduledDate
 *               - exercises
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Chest & Triceps Day"
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-10T10:00:00Z"
 *               exercises:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WorkoutExercise'
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Focus on form today"
 *     responses:
 *       '201':
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  validateRequest(createWorkoutSchema),
  workoutController.createWorkout.bind(workoutController)
);

/**
 * @openapi
 * /workouts:
 *   get:
 *     summary: Get all workouts for authenticated user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, skipped]
 *         description: Filter by workout status
 *       - name: startDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter workouts after this date
 *       - name: endDate
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter workouts before this date
 *     responses:
 *       '200':
 *         description: List of workouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workout'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  workoutController.getUserWorkouts.bind(workoutController)
);

/**
 * @openapi
 * /workouts/stats:
 *   get:
 *     summary: Get workout statistics for authenticated user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Workout statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     completed:
 *                       type: integer
 *                       example: 35
 *                     scheduled:
 *                       type: integer
 *                       example: 10
 *                     skipped:
 *                       type: integer
 *                       example: 5
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/stats",
  authenticate,
  workoutController.getWorkoutStats.bind(workoutController)
);

/**
 * @openapi
 * /workouts/{workoutId}:
 *   get:
 *     summary: Get a specific workout by ID
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workoutId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout ID
 *     responses:
 *       '200':
 *         description: Workout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not authorized to view this workout
 *       '404':
 *         description: Workout not found
 */
router.get(
  "/:workoutId",
  authenticate,
  workoutController.getWorkoutById.bind(workoutController)
);

/**
 * @openapi
 * /workouts/{workoutId}:
 *   put:
 *     summary: Update a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workoutId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, skipped]
 *               exercises:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/WorkoutExercise'
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 300
 *     responses:
 *       '200':
 *         description: Workout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not authorized to update this workout
 *       '404':
 *         description: Workout not found
 */
router.put(
  "/:workoutId",
  authenticate,
  validateRequest(updateWorkoutSchema),
  workoutController.updateWorkout.bind(workoutController)
);

/**
 * @openapi
 * /workouts/{workoutId}:
 *   delete:
 *     summary: Delete a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workoutId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout ID
 *     responses:
 *       '200':
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Workout deleted successfully"
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not authorized to delete this workout
 *       '404':
 *         description: Workout not found
 */
router.delete(
  "/:workoutId",
  authenticate,
  workoutController.deleteWorkout.bind(workoutController)
);

export default router;
