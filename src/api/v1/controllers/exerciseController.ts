import { Request, Response, NextFunction } from "express";
import { ExerciseService } from "../services/exerciseService";

const exerciseService = new ExerciseService();

/**
 * Filter options for exercises
 */
interface ExerciseQueryFilters {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
}

/**
 * Exercise Controller
 * Handles HTTP requests and responses for exercise endpoints
 */
export class ExerciseController {
  /**
   * Create a new exercise
   */
  async createExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = res.locals.uid;
      const exerciseData = req.body;

      const exercise = await exerciseService.createExercise(userId, exerciseData);

      res.status(201).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exerciseId } = req.params;

      const exercise = await exerciseService.getExerciseById(exerciseId);

      res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all exercises with optional filters
   */
  async getAllExercises(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ExerciseQueryFilters = {};

      if (req.query.category) {
        filters.category = req.query.category as string;
      }

      if (req.query.muscleGroup) {
        filters.muscleGroup = req.query.muscleGroup as string;
      }

      if (req.query.equipment) {
        filters.equipment = req.query.equipment as string;
      }

      if (req.query.difficulty) {
        filters.difficulty = req.query.difficulty as string;
      }

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const exercises = await exerciseService.getAllExercises(filters);

      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an exercise
   */
  async updateExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exerciseId } = req.params;
      const updateData = req.body;

      const exercise = await exerciseService.updateExercise(exerciseId, updateData);

      res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an exercise
   */
  async deleteExercise(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exerciseId } = req.params;

      await exerciseService.deleteExercise(exerciseId);

      res.status(200).json({
        success: true,
        message: "Exercise deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
