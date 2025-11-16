import { db } from "../../../config/firebaseConfig";
import {
  WorkoutPlan,
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  WorkoutPlanEnrollment,
} from "../models/workoutPlan";
import { NotFoundError } from "../models/errors";
import { Query, DocumentData } from "firebase-admin/firestore";

const PLANS_COLLECTION = "workoutPlans";
const ENROLLMENTS_COLLECTION = "workoutPlanEnrollments";

/**
 * Filter options for workout plans
 */
interface WorkoutPlanFilters {
  difficulty?: string;
  isPublic?: boolean;
  createdBy?: string;
}

/**
 * Workout Plan Repository
 * Handles all Firestore operations for workout plans
 */
export class WorkoutPlanRepository {
  /**
   * Create a new workout plan in Firestore
   */
  async create(createdBy: string, planData: CreateWorkoutPlanDto): Promise<WorkoutPlan> {
    const planRef = db.collection(PLANS_COLLECTION).doc();

    const now = new Date();
    const plan: WorkoutPlan = {
      id: planRef.id,
      ...planData,
      isPublic: planData.isPublic ?? true,
      createdBy,
      enrolledCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await planRef.set({
      ...plan,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return plan;
  }

  /**
   * Find workout plan by ID
   */
  async findById(planId: string): Promise<WorkoutPlan> {
    const planDoc = await db.collection(PLANS_COLLECTION).doc(planId).get();

    if (!planDoc.exists) {
      throw new NotFoundError(`Workout plan with ID ${planId} not found`);
    }

    const data = planDoc.data()!;
    return {
      id: planDoc.id,
      name: data.name,
      description: data.description,
      duration: data.duration,
      difficulty: data.difficulty,
      workouts: data.workouts,
      createdBy: data.createdBy,
      isPublic: data.isPublic,
      enrolledCount: data.enrolledCount || 0,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Find all workout plans with optional filters
   */
  async findAll(filters?: WorkoutPlanFilters): Promise<WorkoutPlan[]> {
    let query: Query<DocumentData> = db.collection(PLANS_COLLECTION);

    // Apply filters
    if (filters?.difficulty) {
      query = query.where("difficulty", "==", filters.difficulty);
    }

    if (filters?.isPublic !== undefined) {
      query = query.where("isPublic", "==", filters.isPublic);
    }

    if (filters?.createdBy) {
      query = query.where("createdBy", "==", filters.createdBy);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        difficulty: data.difficulty,
        workouts: data.workouts,
        createdBy: data.createdBy,
        isPublic: data.isPublic,
        enrolledCount: data.enrolledCount || 0,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Update a workout plan
   */
  async update(planId: string, updateData: UpdateWorkoutPlanDto): Promise<WorkoutPlan> {
    const planRef = db.collection(PLANS_COLLECTION).doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      throw new NotFoundError(`Workout plan with ID ${planId} not found`);
    }

    const updates: Partial<DocumentData> = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await planRef.update(updates);

    // Return updated plan
    return this.findById(planId);
  }

  /**
   * Delete a workout plan
   */
  async delete(planId: string): Promise<void> {
    const planRef = db.collection(PLANS_COLLECTION).doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      throw new NotFoundError(`Workout plan with ID ${planId} not found`);
    }

    await planRef.delete();
  }

  /**
   * Enroll a user in a workout plan
   */
  async enrollUser(userId: string, planId: string): Promise<WorkoutPlanEnrollment> {
    // Check if plan exists
    await this.findById(planId);

    // Check if user is already enrolled
    const existingEnrollment = await db
      .collection(ENROLLMENTS_COLLECTION)
      .where("userId", "==", userId)
      .where("planId", "==", planId)
      .where("status", "==", "active")
      .get();

    if (!existingEnrollment.empty) {
      throw new Error("User is already enrolled in this plan");
    }

    const enrollmentRef = db.collection(ENROLLMENTS_COLLECTION).doc();
    const now = new Date();

    const enrollment: WorkoutPlanEnrollment = {
      id: enrollmentRef.id,
      userId,
      planId,
      startDate: now,
      status: "active",
      currentWeek: 1,
      createdAt: now,
      updatedAt: now,
    };

    await enrollmentRef.set({
      ...enrollment,
      startDate: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    // Increment enrolled count
    await db
      .collection(PLANS_COLLECTION)
      .doc(planId)
      .update({
        enrolledCount: (await this.findById(planId)).enrolledCount + 1,
      });

    return enrollment;
  }

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(userId: string): Promise<WorkoutPlanEnrollment[]> {
    const snapshot = await db
      .collection(ENROLLMENTS_COLLECTION)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        planId: data.planId,
        startDate: new Date(data.startDate),
        status: data.status,
        currentWeek: data.currentWeek,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }
}
