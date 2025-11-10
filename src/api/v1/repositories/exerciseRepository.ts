import { db } from "../../../config/firebaseConfig";
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from "../models/exercise";
import { NotFoundError } from "../models/errors";

const COLLECTION_NAME = "exercises";

/**
 * Exercise Repository
 * Handles all Firestore operations for exercises
 */
export class ExerciseRepository {
  /**
   * Create a new exercise in Firestore
   */
  async create(createdBy: string, exerciseData: CreateExerciseDto): Promise<Exercise> {
    const exerciseRef = db.collection(COLLECTION_NAME).doc();

    const now = new Date();
    const exercise: Exercise = {
      id: exerciseRef.id,
      ...exerciseData,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await exerciseRef.set({
      ...exercise,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return exercise;
  }

  /**
   * Find exercise by ID
   */
  async findById(exerciseId: string): Promise<Exercise> {
    const exerciseDoc = await db.collection(COLLECTION_NAME).doc(exerciseId).get();

    if (!exerciseDoc.exists) {
      throw new NotFoundError(`Exercise with ID ${exerciseId} not found`);
    }

    const data = exerciseDoc.data()!;
    return {
      id: exerciseDoc.id,
      name: data.name,
      category: data.category,
      muscleGroups: data.muscleGroups,
      equipment: data.equipment,
      difficulty: data.difficulty,
      instructions: data.instructions,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      createdBy: data.createdBy,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Find all exercises with optional filters
   */
  async findAll(filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    let query: any = db.collection(COLLECTION_NAME);

    // Apply filters
    if (filters?.category) {
      query = query.where("category", "==", filters.category);
    }

    if (filters?.muscleGroup) {
      query = query.where("muscleGroups", "array-contains", filters.muscleGroup);
    }

    if (filters?.equipment) {
      query = query.where("equipment", "array-contains", filters.equipment);
    }

    if (filters?.difficulty) {
      query = query.where("difficulty", "==", filters.difficulty);
    }

    const snapshot = await query.orderBy("name", "asc").get();

    let exercises = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        muscleGroups: data.muscleGroups,
        equipment: data.equipment,
        difficulty: data.difficulty,
        instructions: data.instructions,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        createdBy: data.createdBy,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });

    // Apply search filter (client-side since Firestore doesn't support full-text search)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      exercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchLower)
      );
    }

    return exercises;
  }

  /**
   * Update an exercise
   */
  async update(exerciseId: string, updateData: UpdateExerciseDto): Promise<Exercise> {
    const exerciseRef = db.collection(COLLECTION_NAME).doc(exerciseId);
    const exerciseDoc = await exerciseRef.get();

    if (!exerciseDoc.exists) {
      throw new NotFoundError(`Exercise with ID ${exerciseId} not found`);
    }

    const updates: any = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await exerciseRef.update(updates);

    // Return updated exercise
    return this.findById(exerciseId);
  }

  /**
   * Delete an exercise
   */
  async delete(exerciseId: string): Promise<void> {
    const exerciseRef = db.collection(COLLECTION_NAME).doc(exerciseId);
    const exerciseDoc = await exerciseRef.get();

    if (!exerciseDoc.exists) {
      throw new NotFoundError(`Exercise with ID ${exerciseId} not found`);
    }

    await exerciseRef.delete();
  }
}
