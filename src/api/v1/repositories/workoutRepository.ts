import { db } from "../../../config/firebaseConfig";
import { Workout, CreateWorkoutDto, UpdateWorkoutDto } from "../models/workout";
import { NotFoundError } from "../models/errors";

const COLLECTION_NAME = "workouts";

/**
 * Workout Repository
 * Handles all Firestore operations for workouts
 */
export class WorkoutRepository {
  /**
   * Create a new workout in Firestore
   */
  async create(userId: string, workoutData: CreateWorkoutDto): Promise<Workout> {
    const workoutRef = db.collection(COLLECTION_NAME).doc();
    
    const now = new Date();
    const workout: Workout = {
      id: workoutRef.id,
      userId,
      name: workoutData.name,
      scheduledDate: workoutData.scheduledDate,
      status: "scheduled",
      exercises: workoutData.exercises,
      notes: workoutData.notes,
      createdAt: now,
      updatedAt: now,
    };

    await workoutRef.set({
      ...workout,
      scheduledDate: workout.scheduledDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return workout;
  }

  /**
   * Find workout by ID
   */
  async findById(workoutId: string): Promise<Workout> {
    const workoutDoc = await db.collection(COLLECTION_NAME).doc(workoutId).get();

    if (!workoutDoc.exists) {
      throw new NotFoundError(`Workout with ID ${workoutId} not found`);
    }

    const data = workoutDoc.data()!;
    return {
      id: workoutDoc.id,
      userId: data.userId,
      name: data.name,
      scheduledDate: new Date(data.scheduledDate),
      status: data.status,
      exercises: data.exercises,
      notes: data.notes,
      duration: data.duration,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Find all workouts for a user
   */
  async findByUserId(
    userId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Workout[]> {
    let query = db.collection(COLLECTION_NAME).where("userId", "==", userId);

    // Apply filters
    if (filters?.status) {
      query = query.where("status", "==", filters.status);
    }

    if (filters?.startDate) {
      query = query.where("scheduledDate", ">=", filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.where("scheduledDate", "<=", filters.endDate.toISOString());
    }

    const snapshot = await query.orderBy("scheduledDate", "desc").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        scheduledDate: new Date(data.scheduledDate),
        status: data.status,
        exercises: data.exercises,
        notes: data.notes,
        duration: data.duration,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  }

  /**
   * Update a workout
   */
  async update(workoutId: string, updateData: UpdateWorkoutDto): Promise<Workout> {
    const workoutRef = db.collection(COLLECTION_NAME).doc(workoutId);
    const workoutDoc = await workoutRef.get();

    if (!workoutDoc.exists) {
      throw new NotFoundError(`Workout with ID ${workoutId} not found`);
    }

    const updates: any = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Convert Date objects to ISO strings
    if (updateData.scheduledDate) {
      updates.scheduledDate = updateData.scheduledDate.toISOString();
    }

    await workoutRef.update(updates);

    // Return updated workout
    return this.findById(workoutId);
  }

  /**
   * Delete a workout
   */
  async delete(workoutId: string): Promise<void> {
    const workoutRef = db.collection(COLLECTION_NAME).doc(workoutId);
    const workoutDoc = await workoutRef.get();

    if (!workoutDoc.exists) {
      throw new NotFoundError(`Workout with ID ${workoutId} not found`);
    }

    await workoutRef.delete();
  }

  /**
   * Check if workout belongs to user
   */
  async belongsToUser(workoutId: string, userId: string): Promise<boolean> {
    const workout = await this.findById(workoutId);
    return workout.userId === userId;
  }
}
