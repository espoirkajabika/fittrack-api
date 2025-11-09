import { WorkoutRepository } from "../repositories/workoutRepository";
import { Workout, CreateWorkoutDto, UpdateWorkoutDto } from "../models/workout";
import { AuthorizationError } from "../models/errors";

/**
 * Workout Service
 * Contains business logic for workout operations
 */
export class WorkoutService {
  private workoutRepository: WorkoutRepository;

  constructor() {
    this.workoutRepository = new WorkoutRepository();
  }

  /**
   * Create a new workout
   */
  async createWorkout(userId: string, workoutData: CreateWorkoutDto): Promise<Workout> {
    return await this.workoutRepository.create(userId, workoutData);
  }

  /**
   * Get workout by ID
   * Checks if user has permission to view
   */
  async getWorkoutById(workoutId: string, userId: string, userRole: string): Promise<Workout> {
    const workout = await this.workoutRepository.findById(workoutId);

    // Check permissions: user can view their own workouts, trainers/coaches/admins can view all
    if (workout.userId !== userId && !["trainer", "coach", "admin"].includes(userRole)) {
      throw new AuthorizationError("You don't have permission to view this workout");
    }

    return workout;
  }

  /**
   * Get all workouts for a user with optional filters
   */
  async getUserWorkouts(
    userId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Workout[]> {
    return await this.workoutRepository.findByUserId(userId, filters);
  }

  /**
   * Update a workout
   * Checks if user has permission to update
   */
  async updateWorkout(
    workoutId: string,
    userId: string,
    userRole: string,
    updateData: UpdateWorkoutDto
  ): Promise<Workout> {
    const workout = await this.workoutRepository.findById(workoutId);

    // Check permissions: user can update their own workouts, trainers/coaches/admins can update all
    if (workout.userId !== userId && !["trainer", "coach", "admin"].includes(userRole)) {
      throw new AuthorizationError("You don't have permission to update this workout");
    }

    return await this.workoutRepository.update(workoutId, updateData);
  }

  /**
   * Delete a workout
   * Checks if user has permission to delete
   */
  async deleteWorkout(workoutId: string, userId: string, userRole: string): Promise<void> {
    const workout = await this.workoutRepository.findById(workoutId);

    // Check permissions: user can delete their own workouts, admins can delete all
    if (workout.userId !== userId && userRole !== "admin") {
      throw new AuthorizationError("You don't have permission to delete this workout");
    }

    await this.workoutRepository.delete(workoutId);
  }

  /**
   * Get workout statistics for a user
   */
  async getWorkoutStats(userId: string): Promise<{
    total: number;
    completed: number;
    scheduled: number;
    skipped: number;
  }> {
    const allWorkouts = await this.workoutRepository.findByUserId(userId);

    return {
      total: allWorkouts.length,
      completed: allWorkouts.filter((w) => w.status === "completed").length,
      scheduled: allWorkouts.filter((w) => w.status === "scheduled").length,
      skipped: allWorkouts.filter((w) => w.status === "skipped").length,
    };
  }
}
