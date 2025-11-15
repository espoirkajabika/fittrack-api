import { Router } from "express";
import { JobController } from "../controllers/jobController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();
const jobController = new JobController();

/**
 * @openapi
 * /jobs:
 *   get:
 *     summary: Get all scheduled jobs
 *     description: Get list of all scheduled jobs with their configurations (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Jobs retrieved successfully
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
 *                     properties:
 *                       name:
 *                         type: string
 *                       schedule:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                       description:
 *                         type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Admin only
 */
router.get(
  "/",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.getJobs.bind(jobController)
);

/**
 * @openapi
 * /jobs/{jobName}/trigger:
 *   post:
 *     summary: Manually trigger a job
 *     description: Execute a scheduled job immediately (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [expire-goals, update-goal-progress, cleanup-old-logs]
 *         description: Name of the job to trigger
 *     responses:
 *       '200':
 *         description: Job executed successfully
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
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Admin only
 *       '500':
 *         description: Job execution failed
 */
router.post(
  "/:jobName/trigger",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.triggerJob.bind(jobController)
);

/**
 * @openapi
 * /jobs/logs:
 *   get:
 *     summary: Get recent job execution logs
 *     description: Get recent job execution logs (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to retrieve
 *     responses:
 *       '200':
 *         description: Logs retrieved successfully
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
 *         description: Forbidden - Admin only
 */
router.get(
  "/logs",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.getJobLogs.bind(jobController)
);

/**
 * @openapi
 * /jobs/{jobName}/logs:
 *   get:
 *     summary: Get logs for a specific job
 *     description: Get execution logs for a specific job (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the job
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of logs to retrieve
 *     responses:
 *       '200':
 *         description: Logs retrieved successfully
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
 *         description: Forbidden - Admin only
 */
router.get(
  "/:jobName/logs",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.getJobLogsByName.bind(jobController)
);

/**
 * @openapi
 * /jobs/{jobName}/stop:
 *   post:
 *     summary: Stop a scheduled job
 *     description: Stop a running scheduled job (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the job to stop
 *     responses:
 *       '200':
 *         description: Job stopped successfully
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
 *         description: Forbidden - Admin only
 *       '404':
 *         description: Job not found
 */
router.post(
  "/:jobName/stop",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.stopJob.bind(jobController)
);

/**
 * @openapi
 * /jobs/{jobName}/start:
 *   post:
 *     summary: Start a scheduled job
 *     description: Start a stopped scheduled job (Admin only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the job to start
 *     responses:
 *       '200':
 *         description: Job started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       '400':
 *         description: Job not found or already running
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Admin only
 */
router.post(
  "/:jobName/start",
  authenticate,
  authorize({ hasRole: ["admin"] }),
  jobController.startJob.bind(jobController)
);

export default router;
