import { db } from "../../../config/firebaseConfig";
import { JobLog, JobResult } from "../models/job";

const JOB_LOGS_COLLECTION = "jobLogs";

/**
 * Job Log Repository
 * Handles logging of scheduled job executions
 */
export class JobLogRepository {
  /**
   * Log a job execution
   */
  async logJobExecution(result: JobResult): Promise<JobLog> {
    const logRef = db.collection(JOB_LOGS_COLLECTION).doc();

    const now = new Date();
    const jobLog: JobLog = {
      id: logRef.id,
      jobName: result.jobName,
      status: result.status,
      startTime: result.startTime,
      endTime: result.endTime || now,
      duration: result.duration || 0,
      itemsProcessed: result.itemsProcessed || 0,
      message: result.message || "",
      error: result.error,
      createdAt: now,
    };

    await logRef.set({
      ...jobLog,
      startTime: jobLog.startTime.toISOString(),
      endTime: jobLog.endTime.toISOString(),
      createdAt: jobLog.createdAt.toISOString(),
    });

    return jobLog;
  }

  /**
   * Get recent job logs
   */
  async getRecentLogs(limit: number = 50): Promise<JobLog[]> {
    const snapshot = await db
      .collection(JOB_LOGS_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        jobName: data.jobName,
        status: data.status,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
        itemsProcessed: data.itemsProcessed,
        message: data.message,
        error: data.error,
        createdAt: new Date(data.createdAt),
      };
    });
  }

  /**
   * Get logs for a specific job
   */
  async getLogsByJobName(jobName: string, limit: number = 20): Promise<JobLog[]> {
    const snapshot = await db
      .collection(JOB_LOGS_COLLECTION)
      .where("jobName", "==", jobName)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        jobName: data.jobName,
        status: data.status,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
        itemsProcessed: data.itemsProcessed,
        message: data.message,
        error: data.error,
        createdAt: new Date(data.createdAt),
      };
    });
  }
}
