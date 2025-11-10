import { Request, Response, NextFunction } from "express";
import { WorkoutPlanService } from "../services/workoutPlanService";

const workoutPlanService = new WorkoutPlanService();

/**
 * Filter options for workout plan queries
 */
interface WorkoutPlanQueryFilters {
  difficulty?: string;
  isPublic?: boolean;
  createdBy?: string;
}

/**
 * Workout Plan Controller
 * Handles HTTP requests and responses for workout plan endpoints
 */
export class WorkoutPlanController {
  /**
   * Create a new workout plan
   */
  async createWorkoutPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const planData = req.body;

      const plan = await workoutPlanService.createWorkoutPlan(userId, planData);

      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get workout plan by ID
   */
  async getWorkoutPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;

      const plan = await workoutPlanService.getWorkoutPlanById(planId);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all workout plans with optional filters
   */
  async getAllWorkoutPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = res.locals.role;

      const filters: WorkoutPlanQueryFilters = {};

      if (req.query.difficulty) {
        filters.difficulty = req.query.difficulty as string;
      }

      if (req.query.createdBy) {
        filters.createdBy = req.query.createdBy as string;
      }

      const plans = await workoutPlanService.getAllWorkoutPlans(userRole, filters);

      res.status(200).json({
        success: true,
        count: plans.length,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a workout plan
   */
  async updateWorkoutPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const updateData = req.body;

      const plan = await workoutPlanService.updateWorkoutPlan(planId, updateData);

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a workout plan
   */
  async deleteWorkoutPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;

      await workoutPlanService.deleteWorkoutPlan(planId);

      res.status(200).json({
        success: true,
        message: "Workout plan deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enroll user in a workout plan
   */
  async enrollInPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = res.locals.uid;

      const result = await workoutPlanService.enrollUserInPlan(userId, planId);

      res.status(201).json({
        success: true,
        message: `Successfully enrolled in plan. ${result.workoutsCreated} workouts created for week 1.`,
        data: result.enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;

      const enrollments = await workoutPlanService.getUserEnrollments(userId);

      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  }
}
