import { db } from "../../../config/firebaseConfig";
import {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalProgressUpdate,
  GoalStatistics,
} from "../models/goal";
import { NotFoundError } from "../models/errors";
import { Query, DocumentData } from "firebase-admin/firestore";

const GOALS_COLLECTION = "goals";

/**
 * Filter options for goals
 */
interface GoalFilters {
  type?: string;
  status?: string;
}

/**
 * Goal Repository
 * Handles all Firestore operations for goals
 */
export class GoalRepository {
  /**
   * Create a new goal
   */
  async create(userId: string, goalData: CreateGoalDto): Promise<Goal> {
    const goalRef = db.collection(GOALS_COLLECTION).doc();

    const now = new Date();
    const goal: Goal = {
      id: goalRef.id,
      userId,
      type: goalData.type,
      title: goalData.title,
      description: goalData.description,
      targetWeight: goalData.targetWeight,
      targetBodyFat: goalData.targetBodyFat,
      strengthTarget: goalData.strengthTarget,
      frequencyTarget: goalData.frequencyTarget,
      customTarget: goalData.customTarget,
      startValue: goalData.startValue,
      currentValue: goalData.startValue,
      currentProgress: 0,
      startDate: now,
      deadline: goalData.deadline,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    await goalRef.set({
      ...goal,
      startDate: now.toISOString(),
      deadline: goal.deadline.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return goal;
  }

  /**
   * Find goal by ID
   */
  async findById(goalId: string): Promise<Goal> {
    const goalDoc = await db.collection(GOALS_COLLECTION).doc(goalId).get();

    if (!goalDoc.exists) {
      throw new NotFoundError(`Goal with ID ${goalId} not found`);
    }

    const data = goalDoc.data()!;
    return {
      id: goalDoc.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      targetWeight: data.targetWeight,
      targetBodyFat: data.targetBodyFat,
      strengthTarget: data.strengthTarget,
      frequencyTarget: data.frequencyTarget,
      customTarget: data.customTarget,
      startValue: data.startValue,
      currentValue: data.currentValue,
      currentProgress: data.currentProgress,
      startDate: new Date(data.startDate),
      deadline: new Date(data.deadline),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      status: data.status,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Find all goals for a user
   */
  async findByUser(userId: string, filters?: GoalFilters): Promise<Goal[]> {
    let query: Query<DocumentData> = db
      .collection(GOALS_COLLECTION)
      .where("userId", "==", userId);

    if (filters?.type) {
      query = query.where("type", "==", filters.type);
    }

    if (filters?.status) {
      query = query.where("status", "==", filters.status);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        targetWeight: data.targetWeight,
        targetBodyFat: data.targetBodyFat,
        strengthTarget: data.strengthTarget,
        frequencyTarget: data.frequencyTarget,
        customTarget: data.customTarget,
        startValue: data.startValue,
        currentValue: data.currentValue,
        currentProgress: data.currentProgress,
        startDate: new Date(data.startDate),
        deadline: new Date(data.deadline),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        status: data.status,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Update a goal
   */
  async update(goalId: string, updateData: UpdateGoalDto): Promise<Goal> {
    const goalRef = db.collection(GOALS_COLLECTION).doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      throw new NotFoundError(`Goal with ID ${goalId} not found`);
    }

    const updates: Partial<DocumentData> = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Convert deadline to ISO string if present
    if (updateData.deadline) {
      updates.deadline = updateData.deadline.toISOString();
    }

    // Set completedAt if status is being changed to completed
    if (updateData.status === "completed" && goalDoc.data()!.status !== "completed") {
      updates.completedAt = new Date().toISOString();
    }

    await goalRef.update(updates);

    return this.findById(goalId);
  }

  /**
   * Update goal progress
   */
  async updateProgress(goalId: string, progress: GoalProgressUpdate): Promise<Goal> {
    const goalRef = db.collection(GOALS_COLLECTION).doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      throw new NotFoundError(`Goal with ID ${goalId} not found`);
    }

    const updates: Partial<DocumentData> = {
      ...progress,
      updatedAt: new Date().toISOString(),
    };

    await goalRef.update(updates);

    return this.findById(goalId);
  }

  /**
   * Delete a goal
   */
  async delete(goalId: string): Promise<void> {
    const goalRef = db.collection(GOALS_COLLECTION).doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      throw new NotFoundError(`Goal with ID ${goalId} not found`);
    }

    await goalRef.delete();
  }

  /**
   * Get goal statistics for a user
   */
  async getStatistics(userId: string): Promise<GoalStatistics> {
    const allGoals = await this.findByUser(userId);

    const completedGoals = allGoals.filter((g) => g.status === "completed");
    const activeGoals = allGoals.filter((g) => g.status === "active");
    const abandonedGoals = allGoals.filter((g) => g.status === "abandoned");

    // Calculate average days to complete
    let totalDays = 0;
    completedGoals.forEach((goal) => {
      if (goal.completedAt) {
        const days =
          (goal.completedAt.getTime() - goal.startDate.getTime()) /
          (1000 * 60 * 60 * 24);
        totalDays += days;
      }
    });

    const averageDaysToComplete =
      completedGoals.length > 0 ? totalDays / completedGoals.length : 0;

    // Count goals by type
    const goalsByType = {
      weight: allGoals.filter((g) => g.type === "weight").length,
      body_fat: allGoals.filter((g) => g.type === "body_fat").length,
      strength: allGoals.filter((g) => g.type === "strength").length,
      workout_frequency: allGoals.filter((g) => g.type === "workout_frequency").length,
      custom: allGoals.filter((g) => g.type === "custom").length,
    };

    return {
      totalGoals: allGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      abandonedGoals: abandonedGoals.length,
      completionRate:
        allGoals.length > 0 ? (completedGoals.length / allGoals.length) * 100 : 0,
      averageDaysToComplete: Math.round(averageDaysToComplete),
      goalsByType,
    };
  }

  /**
   * Get all active goals (for scheduled jobs)
   */
  async findAllActiveGoals(): Promise<Goal[]> {
    const snapshot = await db
      .collection(GOALS_COLLECTION)
      .where("status", "==", "active")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        targetWeight: data.targetWeight,
        targetBodyFat: data.targetBodyFat,
        strengthTarget: data.strengthTarget,
        frequencyTarget: data.frequencyTarget,
        customTarget: data.customTarget,
        startValue: data.startValue,
        currentValue: data.currentValue,
        currentProgress: data.currentProgress,
        startDate: new Date(data.startDate),
        deadline: new Date(data.deadline),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        status: data.status,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }
}
