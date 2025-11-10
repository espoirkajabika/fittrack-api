import { Request, Response, NextFunction } from "express";
import { WorkoutService } from "../services/workoutService";

const workoutService = new WorkoutService();

/**
 * Filter options for workout queries
 */
interface WorkoutQueryFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Workout Controller
 * Handles HTTP requests and responses for workout endpoints
 */
export class WorkoutController {
  /**
   * Create a new workout
   */
  async createWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const workoutData = req.body;

      const workout = await workoutService.createWorkout(userId, workoutData);

      res.status(201).json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout by ID
   */
  async getWorkoutById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workoutId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const workout = await workoutService.getWorkoutById(workoutId, userId, userRole);

      res.status(200).json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all workouts for authenticated user
   */
  async getUserWorkouts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      
      // Extract query parameters for filtering
      const filters: WorkoutQueryFilters = {};
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const workouts = await workoutService.getUserWorkouts(userId, filters);

      res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a workout
   */
  async updateWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workoutId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;
      const updateData = req.body;

      const workout = await workoutService.updateWorkout(
        workoutId,
        userId,
        userRole,
        updateData
      );

      res.status(200).json({
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a workout
   */
  async deleteWorkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workoutId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      await workoutService.deleteWorkout(workoutId, userId, userRole);

      res.status(200).json({
        success: true,
        message: "Workout deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;

      const stats = await workoutService.getWorkoutStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
