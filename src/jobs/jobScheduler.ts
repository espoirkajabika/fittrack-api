import * as cron from "node-cron";
import { ExpireGoalsJob } from "./expireGoalsJob";
import { UpdateGoalProgressJob } from "./updateGoalProgressJob";
import { CleanupOldLogsJob } from "./cleanupOldLogsJob";
import { JobLogRepository } from "../api/v1/repositories/jobLogRepository";
import { JobConfig, JobResult } from "../api/v1/models/job";

/**
 * Job Scheduler
 * Manages all scheduled background jobs using node-cron
 */
export class JobScheduler {
  private jobLogRepository: JobLogRepository;
  private scheduledJobs: Map<string, cron.ScheduledTask>;
  private jobConfigs: JobConfig[];

  constructor() {
    this.jobLogRepository = new JobLogRepository();
    this.scheduledJobs = new Map();
    this.jobConfigs = [
      {
        name: "expire-goals",
        schedule: "0 0 * * *", // Daily at midnight
        enabled: true,
        description: "Check and expire outdated goals",
      },
      {
        name: "update-goal-progress",
        schedule: "0 */6 * * *", // Every 6 hours
        enabled: true,
        description: "Update progress for all active goals",
      },
      {
        name: "cleanup-old-logs",
        schedule: "0 2 * * 0", // Weekly on Sunday at 2 AM
        enabled: true,
        description: "Clean up job logs older than 90 days",
      },
    ];
  }

  /**
   * Initialize and start all scheduled jobs
   */
  startAll(): void {
    console.log("🚀 Starting job scheduler...");

    this.jobConfigs.forEach((config) => {
      if (config.enabled) {
        this.scheduleJob(config);
      }
    });

    console.log(
      `Job scheduler started with ${this.scheduledJobs.size} active jobs`
    );
    this.listScheduledJobs();
  }

  /**
   * Schedule a single job
   */
  private scheduleJob(config: JobConfig): void {
    const task = cron.schedule(
      config.schedule,
      async () => {
        await this.executeJob(config.name);
      },
      {
        timezone: "America/Winnipeg", // Adjust to your timezone
      }
    );

    this.scheduledJobs.set(config.name, task);
    console.log(`Scheduled job: ${config.name} (${config.schedule})`);
  }

  /**
   * Execute a job by name (can be called manually or by scheduler)
   */
  async executeJob(jobName: string): Promise<JobResult> {
    console.log(`Executing job: ${jobName}`);

    let result: JobResult;

    switch (jobName) {
      case "expire-goals":
        const expireGoalsJob = new ExpireGoalsJob();
        result = await expireGoalsJob.execute();
        break;

      case "update-goal-progress":
        const updateProgressJob = new UpdateGoalProgressJob();
        result = await updateProgressJob.execute();
        break;

      case "cleanup-old-logs":
        const cleanupJob = new CleanupOldLogsJob();
        result = await cleanupJob.execute();
        break;

      default:
        result = {
          jobName,
          status: "failure",
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          message: `Unknown job: ${jobName}`,
          error: "Job not found",
        };
    }

    // Log the execution
    await this.jobLogRepository.logJobExecution(result);

    return result;
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    console.log("Stopping all scheduled jobs...");

    this.scheduledJobs.forEach((task, name) => {
      task.stop();
      console.log(`Stopped job: ${name}`);
    });

    this.scheduledJobs.clear();
    console.log("All jobs stopped");
  }

  /**
   * Stop a specific job
   */
  stopJob(jobName: string): boolean {
    const task = this.scheduledJobs.get(jobName);

    if (task) {
      task.stop();
      this.scheduledJobs.delete(jobName);
      console.log(`Stopped job: ${jobName}`);
      return true;
    }

    return false;
  }

  /**
   * Start a specific job
   */
  startJob(jobName: string): boolean {
    const config = this.jobConfigs.find((c) => c.name === jobName);

    if (config && !this.scheduledJobs.has(jobName)) {
      this.scheduleJob(config);
      return true;
    }

    return false;
  }

  /**
   * Get all job configurations
   */
  getJobConfigs(): JobConfig[] {
    return this.jobConfigs.map((config) => ({
      ...config,
      lastRun: undefined, // Would need to query logs for this
      nextRun: this.getNextRunTime(config.schedule),
    }));
  }

  /**
   * Get the next run time for a cron schedule
   */
  private getNextRunTime(_schedule: string): Date | undefined {
    try {
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * List all scheduled jobs
   */
  private listScheduledJobs(): void {
    console.log("\nScheduled Jobs:");
    this.jobConfigs.forEach((config) => {
      const status = this.scheduledJobs.has(config.name) ? "Active" : "Inactive";
      console.log(`   ${status} - ${config.name}: ${config.description}`);
      console.log(`      Schedule: ${config.schedule}`);
    });
    console.log("");
  }

  /**
   * Check if a job is currently running
   */
  isJobRunning(jobName: string): boolean {
    return this.scheduledJobs.has(jobName);
  }
}

// Singleton instance
let schedulerInstance: JobScheduler | null = null;

export const getScheduler = (): JobScheduler => {
  if (!schedulerInstance) {
    schedulerInstance = new JobScheduler();
  }
  return schedulerInstance;
};
