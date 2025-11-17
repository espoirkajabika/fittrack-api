import { JobResult, JobConfig, JobLog } from "../../src/api/v1/models/job";

export const mockJobResult: JobResult = {
  jobName: "expire-goals",
  status: "success",
  startTime: new Date("2025-11-15T10:00:00Z"),
  endTime: new Date("2025-11-15T10:00:05Z"),
  duration: 5000,
  itemsProcessed: 3,
  message: "Successfully expired 3 goals",
};

export const mockFailedJobResult: JobResult = {
  jobName: "update-goal-progress",
  status: "failure",
  startTime: new Date("2025-11-15T10:00:00Z"),
  endTime: new Date("2025-11-15T10:00:02Z"),
  duration: 2000,
  itemsProcessed: 0,
  message: "Job failed",
  error: "Database connection error",
};

export const mockJobConfig: JobConfig = {
  name: "expire-goals",
  schedule: "0 0 * * *",
  enabled: true,
  description: "Check and expire outdated goals",
};

export const mockJobLog: JobLog = {
  id: "log-123",
  jobName: "expire-goals",
  status: "success",
  startTime: new Date("2025-11-15T10:00:00Z"),
  endTime: new Date("2025-11-15T10:00:05Z"),
  duration: 5000,
  itemsProcessed: 3,
  message: "Successfully expired 3 goals",
  createdAt: new Date("2025-11-15T10:00:05Z"),
};

export const mockJobLogs: JobLog[] = [
  mockJobLog,
  {
    id: "log-456",
    jobName: "update-goal-progress",
    status: "success",
    startTime: new Date("2025-11-15T06:00:00Z"),
    endTime: new Date("2025-11-15T06:00:10Z"),
    duration: 10000,
    itemsProcessed: 15,
    message: "Successfully updated progress for 15 goals",
    createdAt: new Date("2025-11-15T06:00:10Z"),
  },
];
