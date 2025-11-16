import { Router } from "express";
import { WorkoutPlanController } from "../controllers/workoutPlanController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validateRequest } from "../middleware/validateRequest";
import {
  createWorkoutPlanSchema,
  updateWorkoutPlanSchema,
} from "../validations/workoutPlanSchema";

const router = Router();
const workoutPlanController = new WorkoutPlanController();

/**
 * @openapi
 * /workout-plans:
 *   post:
 *     summary: Create a new workout plan
 *     description: Only trainers, coaches, and admins can create workout plans
 *     tags: [Workout Plans]
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
 *               - description
 *               - duration
 *               - difficulty
 *               - workouts
 *             properties:
 *               name:
 *                 type: string
 *                 example: "6-Week Beginner Program"
 *               description:
 *                 type: string
 *                 example: "A comprehensive program for beginners"
 *               duration:
 *                 type: integer
 *                 example: 6
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "beginner"
 *               workouts:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PlanWorkout'
 *               isPublic:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '201':
 *         description: Workout plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutPlan'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Insufficient permissions
 */
router.post(
  "/",
  authenticate,
  authorize({ hasRole: ["trainer", "coach", "admin"] }),
  validateRequest(createWorkoutPlanSchema),
  workoutPlanController.createWorkoutPlan.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans:
 *   get:
 *     summary: Get all workout plans
 *     description: Regular users see public plans only. Trainers/coaches/admins see all plans.
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: difficulty
 *         in: query
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty
 *       - name: createdBy
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *     responses:
 *       '200':
 *         description: List of workout plans retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkoutPlan'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  workoutPlanController.getAllWorkoutPlans.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans/{planId}:
 *   get:
 *     summary: Get a specific workout plan by ID
 *     description: All authenticated users can view workout plans
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan ID
 *     responses:
 *       '200':
 *         description: Workout plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutPlan'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Workout plan not found
 */
router.get(
  "/:planId",
  authenticate,
  workoutPlanController.getWorkoutPlanById.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans/{planId}:
 *   put:
 *     summary: Update a workout plan
 *     description: Only trainers, coaches, and admins can update workout plans
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               workouts:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/PlanWorkout'
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Workout plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WorkoutPlan'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Insufficient permissions
 *       '404':
 *         description: Workout plan not found
 */
router.put(
  "/:planId",
  authenticate,
  authorize({ hasRole: ["trainer", "coach", "admin"] }),
  validateRequest(updateWorkoutPlanSchema),
  workoutPlanController.updateWorkoutPlan.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans/{planId}:
 *   delete:
 *     summary: Delete a workout plan
 *     description: Only admins can delete workout plans
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan ID
 *     responses:
 *       '200':
 *         description: Workout plan deleted successfully
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
 *         description: Forbidden - Only admins can delete workout plans
 *       '404':
 *         description: Workout plan not found
 */
router.delete(
  "/:planId",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  workoutPlanController.deleteWorkoutPlan.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans/{planId}/enroll:
 *   post:
 *     summary: Enroll in a workout plan
 *     description: Authenticated users can enroll in public workout plans. Automatically generates first week's workouts.
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: planId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The workout plan ID
 *     responses:
 *       '201':
 *         description: Successfully enrolled in workout plan
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
 *       '400':
 *         description: User already enrolled or invalid plan
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Workout plan not found
 */
router.post(
  "/:planId/enroll",
  authenticate,
  workoutPlanController.enrollInPlan.bind(workoutPlanController)
);

/**
 * @openapi
 * /workout-plans/enrollments/me:
 *   get:
 *     summary: Get user's workout plan enrollments
 *     description: Get all workout plans the authenticated user is enrolled in
 *     tags: [Workout Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of enrollments retrieved successfully
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
  "/enrollments/me",
  authenticate,
  workoutPlanController.getUserEnrollments.bind(workoutPlanController)
);

export default router;
