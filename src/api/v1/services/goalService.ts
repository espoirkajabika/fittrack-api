import { GoalRepository } from "../repositories/goalRepository";
import { ProgressRepository } from "../repositories/progressRepository";
import {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalStatistics,
} from "../models/goal";
import { AuthorizationError } from "../models/errors";

/**
 * Filter options for goals
 */
interface GoalFilters {
  type?: string;
  status?: string;
}

/**
 * Goal Service
 * Contains business logic for goal management
 */
export class GoalService {
  private goalRepository: GoalRepository;
  private progressRepository: ProgressRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
    this.progressRepository = new ProgressRepository();
  }

  /**
   * Create a new goal
   */
  async createGoal(userId: string, goalData: CreateGoalDto): Promise<Goal> {
    // If it's a weight or body fat goal, try to set startValue from recent metrics
    if (
      (goalData.type === "weight" || goalData.type === "body_fat") &&
      !goalData.startValue
    ) {
      const recentMetrics = await this.progressRepository.findBodyMetricsByUser(
        userId
      );

      if (recentMetrics.length > 0) {
        const latestMetrics = recentMetrics[0];
        if (goalData.type === "weight" && latestMetrics.weight) {
          goalData.startValue = latestMetrics.weight;
        } else if (goalData.type === "body_fat" && latestMetrics.bodyFat) {
          goalData.startValue = latestMetrics.bodyFat;
        }
      }
    }

    return await this.goalRepository.create(userId, goalData);
  }

  /**
   * Get goal by ID
   */
  async getGoalById(
    goalId: string,
    userId: string,
    userRole: string
  ): Promise<Goal> {
    const goal = await this.goalRepository.findById(goalId);

    // Check authorization
    if (
      goal.userId !== userId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError("You don't have permission to view this goal");
    }

    return goal;
  }

  /**
   * Get all goals for a user
   */
  async getUserGoals(
    userId: string,
    requestingUserId: string,
    userRole: string,
    filters?: GoalFilters
  ): Promise<Goal[]> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's goals"
      );
    }

    return await this.goalRepository.findByUser(userId, filters);
  }

  /**
   * Update a goal
   */
  async updateGoal(
    goalId: string,
    userId: string,
    updateData: UpdateGoalDto
  ): Promise<Goal> {
    const goal = await this.goalRepository.findById(goalId);

    // Users can only update their own goals
    if (goal.userId !== userId) {
      throw new AuthorizationError("You don't have permission to update this goal");
    }

    return await this.goalRepository.update(goalId, updateData);
  }

  /**
   * Delete a goal
   */
  async deleteGoal(goalId: string, userId: string): Promise<void> {
    const goal = await this.goalRepository.findById(goalId);

    // Users can only delete their own goals
    if (goal.userId !== userId) {
      throw new AuthorizationError("You don't have permission to delete this goal");
    }

    await this.goalRepository.delete(goalId);
  }

  /**
   * Mark goal as completed
   */
  async completeGoal(goalId: string, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(goalId);

    // Users can only complete their own goals
    if (goal.userId !== userId) {
      throw new AuthorizationError("You don't have permission to complete this goal");
    }

    return await this.goalRepository.update(goalId, {
      status: "completed",
    });
  }

  /**
   * Mark goal as abandoned
   */
  async abandonGoal(goalId: string, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(goalId);

    // Users can only abandon their own goals
    if (goal.userId !== userId) {
      throw new AuthorizationError("You don't have permission to abandon this goal");
    }

    return await this.goalRepository.update(goalId, {
      status: "abandoned",
    });
  }

  /**
   * Update goal progress automatically based on recent data
   */
  async updateGoalProgress(goalId: string, userId: string): Promise<Goal> {
    const goal = await this.goalRepository.findById(goalId);

    // Users can only update progress on their own goals
    if (goal.userId !== userId) {
      throw new AuthorizationError(
        "You don't have permission to update this goal's progress"
      );
    }

    let currentValue: number | undefined;
    let currentProgress: number | undefined;

    switch (goal.type) {
      case "weight":
      case "body_fat": {
        // Get most recent body metrics
        const metrics = await this.progressRepository.findBodyMetricsByUser(userId);
        if (metrics.length > 0) {
          const latest = metrics[0];
          currentValue =
            goal.type === "weight" ? latest.weight : latest.bodyFat;

          // Calculate progress
          if (
            currentValue !== undefined &&
            goal.startValue !== undefined &&
            (goal.targetWeight !== undefined || goal.targetBodyFat !== undefined)
          ) {
            const target =
              goal.type === "weight" ? goal.targetWeight! : goal.targetBodyFat!;
            const totalChange = target - goal.startValue;
            const currentChange = currentValue - goal.startValue;

            // Handle both weight loss and weight gain scenarios
            if (totalChange !== 0) {
              currentProgress = Math.min(
                100,
                Math.max(0, (currentChange / totalChange) * 100)
              );
            }
          }
        }
        break;
      }

      case "strength": {
        // Get personal record for the exercise
        if (goal.strengthTarget) {
          const prs = await this.progressRepository.findPersonalRecordsByUser(
            userId
          );
          const exercisePR = prs.find(
            (pr) => pr.exerciseId === goal.strengthTarget!.exerciseId
          );

          if (exercisePR) {
            // Check if PR meets or exceeds the target
            const targetMet =
              exercisePR.weight >= goal.strengthTarget.targetWeight &&
              exercisePR.reps >= goal.strengthTarget.targetReps;

            if (targetMet) {
              currentProgress = 100;
              // Auto-complete the goal
              await this.goalRepository.update(goalId, {
                status: "completed",
              });
            } else {
              // Calculate progress based on weight (simplified)
              currentProgress = Math.min(
                100,
                (exercisePR.weight / goal.strengthTarget.targetWeight) * 100
              );
            }
          }
        }
        break;
      }

      case "workout_frequency": {
        // Get workout progress for the current period
        if (goal.frequencyTarget) {
          const now = new Date();
          let startDate: Date;

          if (goal.frequencyTarget.workoutsPerWeek !== undefined) {
            // Check last 7 days
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const workouts = await this.progressRepository.findWorkoutProgressByUser(
              userId,
              startDate,
              now
            );

            const target = goal.frequencyTarget.workoutsPerWeek;
            currentProgress = Math.min(100, (workouts.length / target) * 100);
          } else if (goal.frequencyTarget.workoutsPerMonth !== undefined) {
            // Check last 30 days
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const workouts = await this.progressRepository.findWorkoutProgressByUser(
              userId,
              startDate,
              now
            );

            const target = goal.frequencyTarget.workoutsPerMonth;
            currentProgress = Math.min(100, (workouts.length / target) * 100);
          }
        }
        break;
      }

      case "custom":
        // Custom goals need manual progress updates
        break;
    }

    // Update the goal with new progress
    if (currentValue !== undefined || currentProgress !== undefined) {
      return await this.goalRepository.updateProgress(goalId, {
        currentValue,
        currentProgress,
      });
    }

    return goal;
  }

  /**
   * Get goal statistics
   */
  async getGoalStatistics(
    userId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<GoalStatistics> {
    // Check authorization
    if (
      userId !== requestingUserId &&
      !["trainer", "coach", "admin"].includes(userRole)
    ) {
      throw new AuthorizationError(
        "You don't have permission to view this user's goal statistics"
      );
    }

    return await this.goalRepository.getStatistics(userId);
  }

  /**
   * Check and expire outdated goals
   */
  async checkExpiredGoals(userId: string): Promise<Goal[]> {
    const activeGoals = await this.goalRepository.findByUser(userId, {
      status: "active",
    });

    const now = new Date();
    const expiredGoals: Goal[] = [];

    for (const goal of activeGoals) {
      if (goal.deadline < now) {
        const updated = await this.goalRepository.update(goal.id, {
          status: "expired",
        });
        expiredGoals.push(updated);
      }
    }

    return expiredGoals;
  }
}
