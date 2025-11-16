import { Request, Response, NextFunction } from "express";
import { GoalService } from "../services/goalService";

const goalService = new GoalService();

/**
 * Filter options for goal queries
 */
interface GoalQueryFilters {
  type?: string;
  status?: string;
}

/**
 * Goal Controller
 * Handles HTTP requests and responses for goal endpoints
 */
export class GoalController {
  /**
   * Create a new goal
   */
  async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const goalData = req.body;

      const goal = await goalService.createGoal(userId, goalData);

      res.status(201).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get goal by ID
   */
  async getGoalById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const goal = await goalService.getGoalById(goalId, userId, userRole);

      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all goals for a user
   */
  async getUserGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      const filters: GoalQueryFilters = {};

      if (req.query.type) {
        filters.type = req.query.type as string;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const goals = await goalService.getUserGoals(
        userId,
        requestingUserId,
        userRole,
        filters
      );

      res.status(200).json({
        success: true,
        count: goals.length,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my goals (convenience endpoint)
   */
  async getMyGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const filters: GoalQueryFilters = {};

      if (req.query.type) {
        filters.type = req.query.type as string;
      }

      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const goals = await goalService.getUserGoals(userId, userId, userRole, filters);

      res.status(200).json({
        success: true,
        count: goals.length,
        data: goals,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a goal
   */
  async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;
      const updateData = req.body;

      const goal = await goalService.updateGoal(goalId, userId, updateData);

      res.status(200).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a goal
   */
  async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;

      await goalService.deleteGoal(goalId, userId);

      res.status(200).json({
        success: true,
        message: "Goal deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark goal as completed
   */
  async completeGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;

      const goal = await goalService.completeGoal(goalId, userId);

      res.status(200).json({
        success: true,
        message: "Congratulations! Goal completed!",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark goal as abandoned
   */
  async abandonGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;

      const goal = await goalService.abandonGoal(goalId, userId);

      res.status(200).json({
        success: true,
        message: "Goal marked as abandoned",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { goalId } = req.params;
      const userId = res.locals.uid;

      const goal = await goalService.updateGoalProgress(goalId, userId);

      res.status(200).json({
        success: true,
        message: "Goal progress updated",
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get goal statistics
   */
  async getGoalStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = res.locals.uid;
      const userRole = res.locals.role;

      const stats = await goalService.getGoalStatistics(
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
   * Get my goal statistics (convenience endpoint)
   */
  async getMyGoalStatistics(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;
      const userRole = res.locals.role;

      const stats = await goalService.getGoalStatistics(userId, userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check and expire outdated goals
   */
  async checkExpiredGoals(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = res.locals.uid;

      const expiredGoals = await goalService.checkExpiredGoals(userId);

      res.status(200).json({
        success: true,
        message: `${expiredGoals.length} goal(s) marked as expired`,
        data: expiredGoals,
      });
    } catch (error) {
      next(error);
    }
  }
}
