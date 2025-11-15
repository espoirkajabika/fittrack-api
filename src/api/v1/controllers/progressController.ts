import { Request, Response, NextFunction } from "express";
import { ProgressService } from "../services/progressService";

const progressService = new ProgressService();

/**
 * Progress Controller
 * Handles HTTP requests and responses for progress tracking endpoints
 */
export class ProgressController {
  /**
   * Complete a workout
   */
  async completeWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const { workoutId } = req.params;
      const progressData = req.body;

      const result = await progressService.completeWorkout(
        userId,
        workoutId,
        progressData
      );

      res.status(201).json({
        success: true,
        message: `Workout completed! ${result.newPersonalRecords.length} new personal record(s) set.`,
        data: {
          workoutProgress: result.workoutProgress,
          newPersonalRecords: result.newPersonalRecords,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout progress by ID
   */
  async getWorkoutProgressById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { progressId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const progress = await progressService.getWorkoutProgressById(
        progressId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout progress history
   */
  async getWorkoutProgressHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const history = await progressService.getWorkoutProgressHistory(
        userId,
        requestingUserId,
        userRole,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get personal records
   */
  async getPersonalRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      const records = await progressService.getPersonalRecords(
        userId,
        requestingUserId,
        userRole
      );

      res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exercise progress stats
   */
  async getExerciseProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId, exerciseId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      const stats = await progressService.getExerciseProgress(
        userId,
        exerciseId,
        requestingUserId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log body metrics
   */
  async logBodyMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const metricsData = req.body;

      const metrics = await progressService.logBodyMetrics(userId, metricsData);

      res.status(201).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get body metrics by ID
   */
  async getBodyMetricsById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metricsId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const metrics = await progressService.getBodyMetricsById(
        metricsId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get body metrics history
   */
  async getBodyMetricsHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const history = await progressService.getBodyMetricsHistory(
        userId,
        requestingUserId,
        userRole,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update body metrics
   */
  async updateBodyMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metricsId } = req.params;
      const userId = res.locals.uid;
      const updateData = req.body;

      const metrics = await progressService.updateBodyMetrics(
        metricsId,
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete body metrics
   */
  async deleteBodyMetrics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { metricsId } = req.params;
      const userId = res.locals.uid;

      await progressService.deleteBodyMetrics(metricsId, userId);

      res.status(200).json({
        success: true,
        message: "Body metrics deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      const stats = await progressService.getWorkoutStats(
        userId,
        requestingUserId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my workout progress history (convenience endpoint)
   */
  async getMyWorkoutProgressHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const history = await progressService.getWorkoutProgressHistory(
        userId,
        userId,
        userRole,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my personal records (convenience endpoint)
   */
  async getMyPersonalRecords(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const records = await progressService.getPersonalRecords(userId, userId, userRole);

      res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my body metrics history (convenience endpoint)
   */
  async getMyBodyMetricsHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }

      const history = await progressService.getBodyMetricsHistory(
        userId,
        userId,
        userRole,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my workout stats (convenience endpoint)
   */
  async getMyWorkoutStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const stats = await progressService.getWorkoutStats(userId, userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
