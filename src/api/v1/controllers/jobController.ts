import { Request, Response, NextFunction } from "express";
import { getScheduler } from "../../../jobs/jobScheduler";
import { JobLogRepository } from "../repositories/jobLogRepository";

const jobLogRepository = new JobLogRepository();

/**
 * Job Controller
 * Handles manual job triggers and job monitoring
 */
export class JobController {
  /**
   * Get all job configurations
   */
  async getJobs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scheduler = getScheduler();
      const jobs = scheduler.getJobConfigs();

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobName } = req.params;
      const scheduler = getScheduler();

      const result = await scheduler.executeJob(jobName);

      if (result.status === "failure") {
        res.status(500).json({
          success: false,
          message: `Job ${jobName} failed`,
          data: result,
        });
      } else {
        res.status(200).json({
          success: true,
          message: `Job ${jobName} executed successfully`,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent job logs
   */
  async getJobLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await jobLogRepository.getRecentLogs(limit);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logs for a specific job
   */
  async getJobLogsByName(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobName } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const logs = await jobLogRepository.getLogsByJobName(jobName, limit);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stop a specific job
   */
  async stopJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobName } = req.params;
      const scheduler = getScheduler();

      const stopped = scheduler.stopJob(jobName);

      if (stopped) {
        res.status(200).json({
          success: true,
          message: `Job ${jobName} stopped successfully`,
        });
      } else {
        res.status(404).json({
          success: false,
          message: `Job ${jobName} not found or already stopped`,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a specific job
   */
  async startJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobName } = req.params;
      const scheduler = getScheduler();

      const started = scheduler.startJob(jobName);

      if (started) {
        res.status(200).json({
          success: true,
          message: `Job ${jobName} started successfully`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Job ${jobName} not found or already running`,
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
