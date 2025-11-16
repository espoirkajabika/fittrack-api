import { db } from "../../../config/firebaseConfig";
import {
  WorkoutProgress,
  CompleteWorkoutDto,
  BodyMetrics,
  CreateBodyMetricsDto,
  UpdateBodyMetricsDto,
  PersonalRecord,
  ExerciseProgressStats,
} from "../models/progress";
import { NotFoundError } from "../models/errors";
import { Query, DocumentData } from "firebase-admin/firestore";

const WORKOUT_PROGRESS_COLLECTION = "workoutProgress";
const BODY_METRICS_COLLECTION = "bodyMetrics";
const PERSONAL_RECORDS_COLLECTION = "personalRecords";

/**
 * Progress Repository
 * Handles all Firestore operations for progress tracking
 */
export class ProgressRepository {
  /**
   * Log workout completion
   */
  async logWorkoutCompletion(
    userId: string,
    workoutId: string,
    workoutName: string,
    progressData: CompleteWorkoutDto
  ): Promise<WorkoutProgress> {
    const progressRef = db.collection(WORKOUT_PROGRESS_COLLECTION).doc();

    const now = new Date();
    const workoutProgress: WorkoutProgress = {
      id: progressRef.id,
      userId,
      workoutId,
      workoutName,
      completedAt: now,
      duration: progressData.duration,
      exercises: progressData.exercises,
      overallNotes: progressData.overallNotes,
      rating: progressData.rating,
      createdAt: now,
      updatedAt: now,
    };

    await progressRef.set({
      ...workoutProgress,
      completedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return workoutProgress;
  }

  /**
   * Get workout progress by ID
   */
  async findWorkoutProgressById(progressId: string): Promise<WorkoutProgress> {
    const progressDoc = await db
      .collection(WORKOUT_PROGRESS_COLLECTION)
      .doc(progressId)
      .get();

    if (!progressDoc.exists) {
      throw new NotFoundError(`Workout progress with ID ${progressId} not found`);
    }

    const data = progressDoc.data()!;
    return {
      id: progressDoc.id,
      userId: data.userId,
      workoutId: data.workoutId,
      workoutName: data.workoutName,
      completedAt: new Date(data.completedAt),
      duration: data.duration,
      exercises: data.exercises,
      overallNotes: data.overallNotes,
      rating: data.rating,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Get all workout progress for a user
   */
  async findWorkoutProgressByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WorkoutProgress[]> {
    let query: Query<DocumentData> = db
      .collection(WORKOUT_PROGRESS_COLLECTION)
      .where("userId", "==", userId);

    if (startDate) {
      query = query.where("completedAt", ">=", startDate.toISOString());
    }

    if (endDate) {
      query = query.where("completedAt", "<=", endDate.toISOString());
    }

    const snapshot = await query.orderBy("completedAt", "desc").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        workoutId: data.workoutId,
        workoutName: data.workoutName,
        completedAt: new Date(data.completedAt),
        duration: data.duration,
        exercises: data.exercises,
        overallNotes: data.overallNotes,
        rating: data.rating,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Create or update a personal record
   */
  async upsertPersonalRecord(
    userId: string,
    exerciseId: string,
    exerciseName: string,
    weight: number,
    reps: number,
    workoutProgressId?: string
  ): Promise<PersonalRecord> {
    // Check if a PR already exists for this user and exercise
    const existingPR = await db
      .collection(PERSONAL_RECORDS_COLLECTION)
      .where("userId", "==", userId)
      .where("exerciseId", "==", exerciseId)
      .limit(1)
      .get();

    const now = new Date();

    if (!existingPR.empty) {
      // Update existing PR if new weight is higher or same weight with more reps
      const existingDoc = existingPR.docs[0];
      const existingData = existingDoc.data();

      const shouldUpdate =
        weight > existingData.weight ||
        (weight === existingData.weight && reps > existingData.reps);

      if (shouldUpdate) {
        await existingDoc.ref.update({
          weight,
          reps,
          achievedAt: now.toISOString(),
          workoutProgressId,
          updatedAt: now.toISOString(),
        });

        return {
          id: existingDoc.id,
          userId,
          exerciseId,
          exerciseName,
          weight,
          reps,
          achievedAt: now,
          workoutProgressId,
          createdAt: new Date(existingData.createdAt),
          updatedAt: now,
        };
      } else {
        // Return existing PR unchanged
        return {
          id: existingDoc.id,
          userId: existingData.userId,
          exerciseId: existingData.exerciseId,
          exerciseName: existingData.exerciseName,
          weight: existingData.weight,
          reps: existingData.reps,
          achievedAt: new Date(existingData.achievedAt),
          workoutProgressId: existingData.workoutProgressId,
          createdAt: new Date(existingData.createdAt),
          updatedAt: new Date(existingData.updatedAt),
        };
      }
    } else {
      // Create new PR
      const prRef = db.collection(PERSONAL_RECORDS_COLLECTION).doc();
      const newPR: PersonalRecord = {
        id: prRef.id,
        userId,
        exerciseId,
        exerciseName,
        weight,
        reps,
        achievedAt: now,
        workoutProgressId,
        createdAt: now,
        updatedAt: now,
      };

      await prRef.set({
        ...newPR,
        achievedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      return newPR;
    }
  }

  /**
   * Get personal records for a user
   */
  async findPersonalRecordsByUser(userId: string): Promise<PersonalRecord[]> {
    const snapshot = await db
      .collection(PERSONAL_RECORDS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("achievedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        exerciseId: data.exerciseId,
        exerciseName: data.exerciseName,
        weight: data.weight,
        reps: data.reps,
        achievedAt: new Date(data.achievedAt),
        workoutProgressId: data.workoutProgressId,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Get progress stats for a specific exercise
   */
  async getExerciseProgressStats(
    userId: string,
    exerciseId: string
  ): Promise<ExerciseProgressStats | null> {
    // Get all workout progress containing this exercise
    const workoutProgressDocs = await db
      .collection(WORKOUT_PROGRESS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("completedAt", "asc")
      .get();

    const relevantWorkouts = workoutProgressDocs.docs
      .map((doc) => {
        const data = doc.data();
        const exercise = data.exercises.find((e: { exerciseId: string }) => e.exerciseId === exerciseId);
        if (!exercise) return null;

        return {
          date: new Date(data.completedAt),
          exercise,
        };
      })
      .filter((item): item is { date: Date; exercise: { exerciseName: string; completedSets: number; actualWeight: number[]; actualReps: number[] } } => item !== null);

    if (relevantWorkouts.length === 0) {
      return null;
    }

    // Get personal record for this exercise
    const prSnapshot = await db
      .collection(PERSONAL_RECORDS_COLLECTION)
      .where("userId", "==", userId)
      .where("exerciseId", "==", exerciseId)
      .limit(1)
      .get();

    const pr = prSnapshot.empty
      ? { weight: 0, reps: 0, achievedAt: new Date() }
      : {
          weight: prSnapshot.docs[0].data().weight,
          reps: prSnapshot.docs[0].data().reps,
          achievedAt: new Date(prSnapshot.docs[0].data().achievedAt),
        };

    return {
      exerciseId,
      exerciseName: relevantWorkouts[0].exercise.exerciseName || "Unknown Exercise",
      totalWorkouts: relevantWorkouts.length,
      firstRecorded: relevantWorkouts[0].date,
      lastRecorded: relevantWorkouts[relevantWorkouts.length - 1].date,
      personalRecord: pr,
      progressData: relevantWorkouts.map((w) => {
        const maxWeight = Math.max(...w.exercise.actualWeight);
        const avgReps =
          w.exercise.actualReps.reduce((a, b) => a + b, 0) / w.exercise.actualReps.length;
        const volume =
          maxWeight *
          w.exercise.actualReps.reduce((a, b) => a + b, 0) *
          w.exercise.completedSets;

        return {
          date: w.date,
          weight: maxWeight,
          reps: Math.round(avgReps),
          volume,
        };
      }),
    };
  }

  /**
   * Create body metrics entry
   */
  async createBodyMetrics(
    userId: string,
    metricsData: CreateBodyMetricsDto
  ): Promise<BodyMetrics> {
    const metricsRef = db.collection(BODY_METRICS_COLLECTION).doc();

    const now = new Date();
    const metrics: BodyMetrics = {
      id: metricsRef.id,
      userId,
      date: metricsData.date || now,
      weight: metricsData.weight,
      bodyFat: metricsData.bodyFat,
      measurements: metricsData.measurements,
      notes: metricsData.notes,
      createdAt: now,
      updatedAt: now,
    };

    await metricsRef.set({
      ...metrics,
      date: metrics.date.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return metrics;
  }

  /**
   * Get body metrics by ID
   */
  async findBodyMetricsById(metricsId: string): Promise<BodyMetrics> {
    const metricsDoc = await db.collection(BODY_METRICS_COLLECTION).doc(metricsId).get();

    if (!metricsDoc.exists) {
      throw new NotFoundError(`Body metrics with ID ${metricsId} not found`);
    }

    const data = metricsDoc.data()!;
    return {
      id: metricsDoc.id,
      userId: data.userId,
      date: new Date(data.date),
      weight: data.weight,
      bodyFat: data.bodyFat,
      measurements: data.measurements,
      notes: data.notes,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Get body metrics for a user
   */
  async findBodyMetricsByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<BodyMetrics[]> {
    let query: Query<DocumentData> = db
      .collection(BODY_METRICS_COLLECTION)
      .where("userId", "==", userId);

    if (startDate) {
      query = query.where("date", ">=", startDate.toISOString());
    }

    if (endDate) {
      query = query.where("date", "<=", endDate.toISOString());
    }

    const snapshot = await query.orderBy("date", "desc").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        date: new Date(data.date),
        weight: data.weight,
        bodyFat: data.bodyFat,
        measurements: data.measurements,
        notes: data.notes,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Update body metrics
   */
  async updateBodyMetrics(
    metricsId: string,
    updateData: UpdateBodyMetricsDto
  ): Promise<BodyMetrics> {
    const metricsRef = db.collection(BODY_METRICS_COLLECTION).doc(metricsId);
    const metricsDoc = await metricsRef.get();

    if (!metricsDoc.exists) {
      throw new NotFoundError(`Body metrics with ID ${metricsId} not found`);
    }

    const updates: Partial<DocumentData> = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await metricsRef.update(updates);

    return this.findBodyMetricsById(metricsId);
  }

  /**
   * Delete body metrics
   */
  async deleteBodyMetrics(metricsId: string): Promise<void> {
    const metricsRef = db.collection(BODY_METRICS_COLLECTION).doc(metricsId);
    const metricsDoc = await metricsRef.get();

    if (!metricsDoc.exists) {
      throw new NotFoundError(`Body metrics with ID ${metricsId} not found`);
    }

    await metricsRef.delete();
  }
}

