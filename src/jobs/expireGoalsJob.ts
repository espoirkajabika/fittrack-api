import { GoalRepository } from "../api/v1/repositories/goalRepository";
import { JobResult } from "../api/v1/models/job";

/**
 * Expire Goals Job
 * Checks all active goals and marks expired ones
 */
export class ExpireGoalsJob {
  private goalRepository: GoalRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
  }

  async execute(): Promise<JobResult> {
    const startTime = new Date();
    const jobName = "expire-goals";

    try {
      console.log(`[${jobName}] Starting job execution...`);

      // Get all active goals
      const activeGoals = await this.goalRepository.findAllActiveGoals();
      const now = new Date();
      let expiredCount = 0;

      for (const goal of activeGoals) {
        if (goal.deadline < now) {
          await this.goalRepository.update(goal.id, { status: "expired" });
          expiredCount++;
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(
        `[${jobName}] Completed. Expired ${expiredCount} goals in ${duration}ms`
      );

      return {
        jobName,
        status: "success",
        startTime,
        endTime,
        duration,
        itemsProcessed: expiredCount,
        message: `Successfully expired ${expiredCount} goals`,
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
}

