import { db } from "../config/firebaseConfig";
import { JobResult } from "../api/v1/models/job";

/**
 * Cleanup Old Logs Job
 * Removes job logs older than 90 days
 */
export class CleanupOldLogsJob {
  async execute(): Promise<JobResult> {
    const startTime = new Date();
    const jobName = "cleanup-old-logs";

    try {
      console.log(`[${jobName}] Starting job execution...`);

      // Calculate date 90 days ago
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Find old logs
      const oldLogsSnapshot = await db
        .collection("jobLogs")
        .where("createdAt", "<", ninetyDaysAgo.toISOString())
        .get();

      let deletedCount = 0;

      // Delete in batches of 500 (Firestore limit)
      const batch = db.batch();
      oldLogsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      console.log(
        `[${jobName}] Completed. Deleted ${deletedCount} old logs in ${duration}ms`
      );

      return {
        jobName,
        status: "success",
        startTime,
        endTime,
        duration,
        itemsProcessed: deletedCount,
        message: `Successfully deleted ${deletedCount} old logs`,
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
