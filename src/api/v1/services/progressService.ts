import { ProgressRepository } from "../repositories/progressRepository";
import { WorkoutRepository } from "../repositories/workoutRepository";
import {
  WorkoutProgress,
  CompleteWorkoutDto,
  BodyMetrics,
  CreateBodyMetricsDto,
  UpdateBodyMetricsDto,
  PersonalRecord,
  ExerciseProgressStats,
} from "../models/progress";
import { AuthorizationError, NotFoundError } from "../models/errors";

/**
 * Progress Service
 * Contains business logic for progress tracking
 */
export class ProgressService {
  private progressRepository: ProgressRepository;
  private workoutRepository: WorkoutRepository;

  constructor() {
    this.progressRepository = new ProgressRepository();
    this.workoutRepository = new WorkoutRepository();
  }

  /**
   * Complete a workout and log progress
   * Automatically detects and updates personal records
   */
  async completeWorkout(
    userId: string,
    workoutId: string,
    progressData: CompleteWorkoutDto
  ): Promise<{
    workoutProgress: WorkoutProgress;
    newPersonalRecords: PersonalRecord[];
  }> {
    // Verify the workout exists and belongs to the user
    const workout = await this.workoutRepository.findById(workoutId);

    if (workout.userId !== userId) {
      throw new AuthorizationError("You don't have permission to complete this workout");
    }

    // Log the workout completion
    const workoutProgress = await this.progressRepository.logWorkoutCompletion(
      userId,
      workoutId,
      workout.name,
      progressData
    );

    // Check for personal records
    const newPersonalRecords: PersonalRecord[] = [];

    for (const exercise of progressData.exercises) {
      // Calculate max weight for this exercise in this workout
      const maxWeight = Math.max(...exercise.actualWeight);
      const maxWeightIndex = exercise.actualWeight.indexOf(maxWeight);
      const repsAtMaxWeight = exercise.actualReps[maxWeightIndex];

      if (maxWeight > 0 && repsAtMaxWeight > 0) {
        const pr = await this.progressRepository.upsertPersonalRecord(
          userId,
          exercise.exerciseId,
          exercise.exerciseName || "Unknown Exercise",
          maxWeight,
          repsAtMaxWeight,
          workoutProgress.id
        );

        // Check if this is actually a new PR
        const existingPRs = await this.progressRepository.findPersonalRecordsByUser(userId);
        const isNew = existingPRs.some(
          (existing) =>
            existing.id === pr.id &&
            existing.achievedAt.getTime() === workoutProgress.completedAt.getTime()
        );

        if (isNew) {
          newPersonalRecords.push(pr);
        }
      }
    }

    // Update workout status to completed
    await this.workoutRepository.update(workoutId, {
      status: "completed",
      duration: progressData.duration,
    });

    return {
      workoutProgress,
      newPersonalRecords,
    };
  }

  /**
   * Get workout progress by ID
   */
  async getWorkoutProgressById(
    progressId: string,
    userId: string,
    userRole: string
  ): Promise<WorkoutProgress> {
    const progress = await this.progressRepository.findWorkoutProgressById(progressId);

    // Check authorization: users can only view their own progress, trainers/coaches/admins can view all
    if (
      progress.userId !== userId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError("You don't have permission to view this progress");
    }

    return progress;
  }

  /**
   * Get workout progress history for a user
   */
  async getWorkoutProgressHistory(
    userId: string,
    requestingUserId: string,
    userRole: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkoutProgress[]> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's progress"
      );
    }

    return await this.progressRepository.findWorkoutProgressByUser(
      userId,
      startDate,
      endDate
    );
  }

  /**
   * Get personal records for a user
   */
  async getPersonalRecords(
    userId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<PersonalRecord[]> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's personal records"
      );
    }

    return await this.progressRepository.findPersonalRecordsByUser(userId);
  }

  /**
   * Get progress statistics for a specific exercise
   */
  async getExerciseProgress(
    userId: string,
    exerciseId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<ExerciseProgressStats> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's exercise progress"
      );
    }

    const stats = await this.progressRepository.getExerciseProgressStats(
      userId,
      exerciseId
    );

    if (!stats) {
      throw new NotFoundError(
        `No progress data found for exercise ${exerciseId}`
      );
    }

    return stats;
  }

  /**
   * Log body metrics
   */
  async logBodyMetrics(
    userId: string,
    metricsData: CreateBodyMetricsDto
  ): Promise<BodyMetrics> {
    return await this.progressRepository.createBodyMetrics(userId, metricsData);
  }

  /**
   * Get body metrics by ID
   */
  async getBodyMetricsById(
    metricsId: string,
    userId: string,
    userRole: string
  ): Promise<BodyMetrics> {
    const metrics = await this.progressRepository.findBodyMetricsById(metricsId);

    // Check authorization
    if (metrics.userId !== userId && !["trainer", "coach", "admin"].includes(userRole)) {
      throw new AuthorizationError(
        "You don't have permission to view these body metrics"
      );
    }

    return metrics;
  }

  /**
   * Get body metrics history for a user
   */
  async getBodyMetricsHistory(
    userId: string,
    requestingUserId: string,
    userRole: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BodyMetrics[]> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's body metrics"
      );
    }

    return await this.progressRepository.findBodyMetricsByUser(
      userId,
      startDate,
      endDate
    );
  }

  /**
   * Update body metrics
   */
  async updateBodyMetrics(
    metricsId: string,
    userId: string,
    updateData: UpdateBodyMetricsDto
  ): Promise<BodyMetrics> {
    const metrics = await this.progressRepository.findBodyMetricsById(metricsId);

    // Users can only update their own metrics
    if (metrics.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to update these body metrics"
      );
    }

    return await this.progressRepository.updateBodyMetrics(metricsId, updateData);
  }

  /**
   * Delete body metrics
   */
  async deleteBodyMetrics(metricsId: string, userId: string): Promise<void> {
    const metrics = await this.progressRepository.findBodyMetricsById(metricsId);

    // Users can only delete their own metrics
    if (metrics.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to delete these body metrics"
      );
    }

    await this.progressRepository.deleteBodyMetrics(metricsId);
  }

  /**
   * Get workout statistics for a user
   */
  async getWorkoutStats(
    userId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    averageRating: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
  }> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's statistics"
      );
    }

    const allProgress = await this.progressRepository.findWorkoutProgressByUser(userId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const workoutsThisWeek = allProgress.filter(
      (w) => w.completedAt >= weekAgo
    ).length;
    const workoutsThisMonth = allProgress.filter(
      (w) => w.completedAt >= monthAgo
    ).length;

    const totalDuration = allProgress.reduce((sum, w) => sum + w.duration, 0);
    const ratingsSum = allProgress.reduce((sum, w) => sum + (w.rating || 0), 0);
    const ratingsCount = allProgress.filter((w) => w.rating).length;

    return {
      totalWorkouts: allProgress.length,
      totalDuration,
      averageDuration: allProgress.length > 0 ? totalDuration / allProgress.length : 0,
      averageRating: ratingsCount > 0 ? ratingsSum / ratingsCount : 0,
      workoutsThisWeek,
      workoutsThisMonth,
    };
  }
}
