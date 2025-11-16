import { Router } from "express";
import { GoalController } from "../controllers/goalController";
import { authenticate } from "../middleware/authenticate";
import { validateRequest } from "../middleware/validateRequest";
import {
  createGoalSchema,
  updateGoalSchema,
} from "../validations/goalSchema";

const router = Router();
const goalController = new GoalController();

/**
 * @openapi
 * /goals:
 *   post:
 *     summary: Create a new goal
 *     description: Create a fitness goal (weight, body fat, strength, workout frequency, or custom)
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - deadline
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [weight, body_fat, strength, workout_frequency, custom]
 *                 example: "weight"
 *               title:
 *                 type: string
 *                 example: "Lose 10 pounds"
 *               description:
 *                 type: string
 *                 example: "Get down to my target weight for summer"
 *               targetWeight:
 *                 type: number
 *                 example: 70
 *               targetBodyFat:
 *                 type: number
 *                 example: 15
 *               strengthTarget:
 *                 type: object
 *                 properties:
 *                   exerciseId:
 *                     type: string
 *                   exerciseName:
 *                     type: string
 *                   targetWeight:
 *                     type: number
 *                   targetReps:
 *                     type: integer
 *               frequencyTarget:
 *                 type: object
 *                 properties:
 *                   workoutsPerWeek:
 *                     type: integer
 *                   workoutsPerMonth:
 *                     type: integer
 *               customTarget:
 *                 type: string
 *               startValue:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *     responses:
 *       '201':
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  validateRequest(createGoalSchema),
  goalController.createGoal.bind(goalController)
);

/**
 * @openapi
 * /goals/me:
 *   get:
 *     summary: Get my goals
 *     description: Get all goals for the authenticated user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [weight, body_fat, strength, workout_frequency, custom]
 *         description: Filter by goal type
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, completed, abandoned, expired]
 *         description: Filter by goal status
 *     responses:
 *       '200':
 *         description: Goals retrieved successfully
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
 *                     $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me",
  authenticate,
  goalController.getMyGoals.bind(goalController)
);

/**
 * @openapi
 * /goals/me/statistics:
 *   get:
 *     summary: Get my goal statistics
 *     description: Get aggregate statistics about the authenticated user's goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Goal statistics retrieved successfully
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
 *                     totalGoals:
 *                       type: integer
 *                     activeGoals:
 *                       type: integer
 *                     completedGoals:
 *                       type: integer
 *                     abandonedGoals:
 *                       type: integer
 *                     completionRate:
 *                       type: number
 *                     averageDaysToComplete:
 *                       type: integer
 *                     goalsByType:
 *                       type: object
 *       '401':
 *         description: Unauthorized
 */
router.get(
  "/me/statistics",
  authenticate,
  goalController.getMyGoalStatistics.bind(goalController)
);

/**
 * @openapi
 * /goals/me/check-expired:
 *   post:
 *     summary: Check and expire outdated goals
 *     description: Automatically mark goals past their deadline as expired
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Expired goals checked and updated
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 */
router.post(
  "/me/check-expired",
  authenticate,
  goalController.checkExpiredGoals.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}:
 *   get:
 *     summary: Get goal by ID
 *     description: Get a specific goal by its ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       '200':
 *         description: Goal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Goal not found
 */
router.get(
  "/:goalId",
  authenticate,
  goalController.getGoalById.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}:
 *   put:
 *     summary: Update a goal
 *     description: Update goal details (title, description, targets, deadline, status)
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetWeight:
 *                 type: number
 *               targetBodyFat:
 *                 type: number
 *               strengthTarget:
 *                 type: object
 *               frequencyTarget:
 *                 type: object
 *               customTarget:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, completed, abandoned, expired]
 *     responses:
 *       '200':
 *         description: Goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Goal not found
 */
router.put(
  "/:goalId",
  authenticate,
  validateRequest(updateGoalSchema),
  goalController.updateGoal.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}:
 *   delete:
 *     summary: Delete a goal
 *     description: Permanently delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       '200':
 *         description: Goal deleted successfully
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
 *         description: Goal not found
 */
router.delete(
  "/:goalId",
  authenticate,
  goalController.deleteGoal.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}/complete:
 *   post:
 *     summary: Mark goal as completed
 *     description: Mark a goal as successfully completed
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       '200':
 *         description: Goal marked as completed
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
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Goal not found
 */
router.post(
  "/:goalId/complete",
  authenticate,
  goalController.completeGoal.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}/abandon:
 *   post:
 *     summary: Mark goal as abandoned
 *     description: Mark a goal as abandoned (no longer pursuing)
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       '200':
 *         description: Goal marked as abandoned
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
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Goal not found
 */
router.post(
  "/:goalId/abandon",
  authenticate,
  goalController.abandonGoal.bind(goalController)
);

/**
 * @openapi
 * /goals/{goalId}/update-progress:
 *   post:
 *     summary: Update goal progress
 *     description: Automatically update goal progress based on recent body metrics, PRs, or workout frequency
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: goalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       '200':
 *         description: Goal progress updated
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
 *                   $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Goal not found
 */
router.post(
  "/:goalId/update-progress",
  authenticate,
  goalController.updateGoalProgress.bind(goalController)
);

/**
 * @openapi
 * /goals/users/{userId}:
 *   get:
 *     summary: Get goals for a specific user
 *     description: Get all goals for a user (trainers/coaches/admins can view any user)
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [weight, body_fat, strength, workout_frequency, custom]
 *         description: Filter by goal type
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [active, completed, abandoned, expired]
 *         description: Filter by goal status
 *     responses:
 *       '200':
 *         description: Goals retrieved successfully
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
 *                     $ref: '#/components/schemas/Goal'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get(
  "/users/:userId",
  authenticate,
  goalController.getUserGoals.bind(goalController)
);

/**
 * @openapi
 * /goals/users/{userId}/statistics:
 *   get:
 *     summary: Get goal statistics for a user
 *     description: Get aggregate statistics about a user's goals
 *     tags: [Goals]
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
 *         description: Goal statistics retrieved successfully
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
 */
router.get(
  "/users/:userId/statistics",
  authenticate,
  goalController.getGoalStatistics.bind(goalController)
);

export default router;
