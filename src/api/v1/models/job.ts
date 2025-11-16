/**
 * Job execution status
 */
export type JobStatus = "success" | "failure" | "running";

/**
 * Job execution result
 */
export interface JobResult {
  jobName: string;
  status: JobStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  itemsProcessed?: number;
  message?: string;
  error?: string;
}

/**
 * Job configuration
 */
export interface JobConfig {
  name: string;
  schedule: string; // cron expression
  enabled: boolean;
  description: string;
  lastRun?: Date;
  nextRun?: Date;
}

/**
 * Job execution log
 */
export interface JobLog {
  id: string;
  jobName: string;
  status: JobStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  itemsProcessed: number;
  message: string;
  error?: string;
  createdAt: Date;
}
