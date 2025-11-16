import { Router } from "express";
import { ProgressController } from "../controllers/progressController";
import { authenticate } from "../middleware/authenticate";
import { validateRequest } from "../middleware/validateRequest";
import {
  completeWorkoutSchema,
  createBodyMetricsSchema,
  updateBodyMetricsSchema,
} from "../validations/progressSchema";

const router = Router();
const progressController = new ProgressController();

/**
 * @openapi
 * /progress/workouts/{workoutId}/complete:
 *   post:
 *     summary: Complete a workout and log progress
 *     description: Log workout completion with exercise details. Automatically detects and updates personal records.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workoutId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout ID to complete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - duration
 *               - exercises
 *             properties:
 *               duration:
 *                 type: integer
 *                 description: Workout duration in minutes
 *                 example: 45
 *               exercises:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ExerciseProgress'
 *               overallNotes:
 *                 type: string
 *                 example: "Great workout, felt strong"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       '201':
 *         description: Workout completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     workoutProgress:
 *                       $ref: '#/components/schemas/WorkoutProgress'
 *                     newPersonalRecords:
 *                       type: array
 *                       items:
 *                         type: object
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Workout not found
 */
router.post(
  "/workouts/:workoutId/complete",
  authenticate,
  validateRequest(completeWorkoutSchema),
  progressController.completeWorkout.bind(progressController)
);

/**
 * @openapi
 * /progress/workouts/{progressId}:
 *   get:
 *     summary: Get workout progress by ID
 *     description: Get details of a specific workout completion
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: progressId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout progress ID
 *     responses:
 *       '200':
 *         description: Workout progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutProgress'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Workout progress not found
 */
router.get(
  "/workouts/:progressId",
  authenticate,
  progressController.getWorkoutProgressById.bind(progressController)
);

/**
 * @openapi
 * /progress/users/{userId}/workouts:
 *   get:
 *     summary: Get workout progress history for a user
 *     description: Get all completed workouts for a user with optional date filtering
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       '200':
 *         description: Workout progress history retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkoutProgress'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  "/users/:userId/workouts",
  authenticate,
  progressController.getWorkoutProgressHistory.bind(progressController)
);

/**
 * @openapi
 * /progress/me/workouts:
 *   get:
 *     summary: Get my workout progress history
 *     description: Get all completed workouts for the authenticated user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       '200':
 *         description: Workout progress history retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkoutProgress'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me/workouts",
  authenticate,
  progressController.getMyWorkoutProgressHistory.bind(progressController)
);

/**
 * @openapi
 * /progress/users/{userId}/personal-records:
 *   get:
 *     summary: Get personal records for a user
 *     description: Get all personal records (PRs) for a specific user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       '200':
 *         description: Personal records retrieved successfully
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
 *                     type: object
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  "/users/:userId/personal-records",
  authenticate,
  progressController.getPersonalRecords.bind(progressController)
);

/**
 * @openapi
 * /progress/me/personal-records:
 *   get:
 *     summary: Get my personal records
 *     description: Get all personal records for the authenticated user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Personal records retrieved successfully
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
 *                     type: object
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me/personal-records",
  authenticate,
  progressController.getMyPersonalRecords.bind(progressController)
);

/**
 * @openapi
 * /progress/users/{userId}/exercises/{exerciseId}:
 *   get:
 *     summary: Get exercise progress statistics
 *     description: Get detailed progress stats and history for a specific exercise
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - name: exerciseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Exercise ID
 *     responses:
 *       '200':
 *         description: Exercise progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: No progress data found
 */
router.get(
  "/users/:userId/exercises/:exerciseId",
  authenticate,
  progressController.getExerciseProgress.bind(progressController)
);

/**
 * @openapi
 * /progress/users/{userId}/stats:
 *   get:
 *     summary: Get workout statistics for a user
 *     description: Get aggregate workout statistics including totals, averages, and trends
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalWorkouts:
 *                       type: integer
 *                     totalDuration:
 *                       type: integer
 *                     averageDuration:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     workoutsThisWeek:
 *                       type: integer
 *                     workoutsThisMonth:
 *                       type: integer
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  "/users/:userId/stats",
  authenticate,
  progressController.getWorkoutStats.bind(progressController)
);

/**
 * @openapi
 * /progress/me/stats:
 *   get:
 *     summary: Get my workout statistics
 *     description: Get aggregate workout statistics for the authenticated user
 *     tags: [Progress]
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
 *                 data:
 *                   type: object
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me/stats",
  authenticate,
  progressController.getMyWorkoutStats.bind(progressController)
);

/**
 * @openapi
 * /progress/body-metrics:
 *   post:
 *     summary: Log body metrics
 *     description: Record body weight, body fat, and measurements
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               weight:
 *                 type: number
 *                 example: 75.5
 *               bodyFat:
 *                 type: number
 *                 example: 15.2
 *               measurements:
 *                 type: object
 *                 properties:
 *                   chest:
 *                     type: number
 *                   waist:
 *                     type: number
 *                   hips:
 *                     type: number
 *                   thighs:
 *                     type: number
 *                   arms:
 *                     type: number
 *                   neck:
 *                     type: number
 *               notes:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Body metrics logged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BodyMetrics'
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/body-metrics",
  authenticate,
  validateRequest(createBodyMetricsSchema),
  progressController.logBodyMetrics.bind(progressController)
);

/**
 * @openapi
 * /progress/body-metrics/{metricsId}:
 *   get:
 *     summary: Get body metrics by ID
 *     description: Get a specific body metrics entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: metricsId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metrics ID
 *     responses:
 *       '200':
 *         description: Body metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BodyMetrics'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Body metrics not found
 */
router.get(
  "/body-metrics/:metricsId",
  authenticate,
  progressController.getBodyMetricsById.bind(progressController)
);

/**
 * @openapi
 * /progress/body-metrics/{metricsId}:
 *   put:
 *     summary: Update body metrics
 *     description: Update a body metrics entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: metricsId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metrics ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               bodyFat:
 *                 type: number
 *               measurements:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Body metrics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BodyMetrics'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Body metrics not found
 */
router.put(
  "/body-metrics/:metricsId",
  authenticate,
  validateRequest(updateBodyMetricsSchema),
  progressController.updateBodyMetrics.bind(progressController)
);

/**
 * @openapi
 * /progress/body-metrics/{metricsId}:
 *   delete:
 *     summary: Delete body metrics
 *     description: Delete a body metrics entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: metricsId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Body metrics ID
 *     responses:
 *       '200':
 *         description: Body metrics deleted successfully
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
 *         description: Forbidden
 *       '404':
 *         description: Body metrics not found
 */
router.delete(
  "/body-metrics/:metricsId",
  authenticate,
  progressController.deleteBodyMetrics.bind(progressController)
);

/**
 * @openapi
 * /progress/users/{userId}/body-metrics:
 *   get:
 *     summary: Get body metrics history for a user
 *     description: Get all body metrics entries for a user with optional date filtering
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       '200':
 *         description: Body metrics history retrieved successfully
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
 *                     $ref: '#/components/schemas/BodyMetrics'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  "/users/:userId/body-metrics",
  authenticate,
  progressController.getBodyMetricsHistory.bind(progressController)
);

/**
 * @openapi
 * /progress/me/body-metrics:
 *   get:
 *     summary: Get my body metrics history
 *     description: Get all body metrics entries for the authenticated user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       '200':
 *         description: Body metrics history retrieved successfully
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
 *                     $ref: '#/components/schemas/BodyMetrics'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me/body-metrics",
  authenticate,
  progressController.getMyBodyMetricsHistory.bind(progressController)
);

export default router;
