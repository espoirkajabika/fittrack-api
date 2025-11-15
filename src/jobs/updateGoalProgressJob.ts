import { GoalRepository } from "../api/v1/repositories/goalRepository";
import { ProgressRepository } from "../api/v1/repositories/progressRepository";
import { JobResult } from "../api/v1/models/job";
import { Goal } from "../api/v1/models/goal";

/**
 * Update Goal Progress Job
 * Automatically updates progress for all active goals based on recent data
 */
export class UpdateGoalProgressJob {
  private goalRepository: GoalRepository;
  private progressRepository: ProgressRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
    this.progressRepository = new ProgressRepository();
  }

  async execute(): Promise<JobResult> {
    const startTime = new Date();
    const jobName = "update-goal-progress";

    try {
      console.log(`[${jobName}] Starting job execution...`);

      // Get all active goals
      const activeGoals = await this.goalRepository.findAllActiveGoals();
      let updatedCount = 0;

      for (const goal of activeGoals) {
        try {
          // Update progress based on goal type
          if (goal.type === "weight" || goal.type === "body_fat") {
            await this.updateWeightOrBodyFatGoal(goal);
            updatedCount++;
          } else if (goal.type === "strength") {
            await this.updateStrengthGoal(goal);
            updatedCount++;
          } else if (goal.type === "workout_frequency") {
            await this.updateFrequencyGoal(goal);
            updatedCount++;
          }
        } catch (error) {
          console.error(`[${jobName}] Error updating goal ${goal.id}:`, error);
          // Continue with other goals
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(
        `[${jobName}] Completed. Updated ${updatedCount} goals in ${duration}ms`
      );

      return {
        jobName,
        status: "success",
        startTime,
        endTime,
        duration,
        itemsProcessed: updatedCount,
        message: `Successfully updated progress for ${updatedCount} goals`,
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.error(`[${jobName}] Failed:`, error);

      return {
        jobName,
        status: "failure",
        startTime,
        endTime,
        duration,
        itemsProcessed: 0,
        message: "Job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async updateWeightOrBodyFatGoal(goal: Goal): Promise<void> {
    const metrics = await this.progressRepository.findBodyMetricsByUser(goal.userId);

    if (metrics.length > 0) {
      const latest = metrics[0];
      const currentValue =
        goal.type === "weight" ? latest.weight : latest.bodyFat;

      if (currentValue !== undefined && goal.startValue !== undefined) {
        const target =
          goal.type === "weight" ? goal.targetWeight : goal.targetBodyFat;

        if (target !== undefined) {
          const totalChange = target - goal.startValue;
          const currentChange = currentValue - goal.startValue;

          if (totalChange !== 0) {
            const currentProgress = Math.min(
              100,
              Math.max(0, (currentChange / totalChange) * 100)
            );

            await this.goalRepository.updateProgress(goal.id, {
              currentValue,
              currentProgress,
            });
          }
        }
      }
    }
  }

  private async updateStrengthGoal(goal: Goal): Promise<void> {
    if (goal.strengthTarget) {
      const prs = await this.progressRepository.findPersonalRecordsByUser(
        goal.userId
      );
      const exercisePR = prs.find(
        (pr) => pr.exerciseId === goal.strengthTarget!.exerciseId
      );

      if (exercisePR) {
        const targetMet =
          exercisePR.weight >= goal.strengthTarget.targetWeight &&
          exercisePR.reps >= goal.strengthTarget.targetReps;

        if (targetMet) {
          await this.goalRepository.update(goal.id, { status: "completed" });
        } else {
          const currentProgress = Math.min(
            100,
            (exercisePR.weight / goal.strengthTarget.targetWeight) * 100
          );
          await this.goalRepository.updateProgress(goal.id, { currentProgress });
        }
      }
    }
  }

  private async updateFrequencyGoal(goal: Goal): Promise<void> {
    if (goal.frequencyTarget) {
      const now = new Date();
      let startDate: Date;

      if (goal.frequencyTarget.workoutsPerWeek !== undefined) {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const workouts = await this.progressRepository.findWorkoutProgressByUser(
          goal.userId,
          startDate,
          now
        );

        const target = goal.frequencyTarget.workoutsPerWeek;
        const currentProgress = Math.min(100, (workouts.length / target) * 100);

        await this.goalRepository.updateProgress(goal.id, { currentProgress });
      } else if (goal.frequencyTarget.workoutsPerMonth !== undefined) {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const workouts = await this.progressRepository.findWorkoutProgressByUser(
          goal.userId,
          startDate,
          now
        );

        const target = goal.frequencyTarget.workoutsPerMonth;
        const currentProgress = Math.min(100, (workouts.length / target) * 100);

        await this.goalRepository.updateProgress(goal.id, { currentProgress });
      }
    }
  }
}
