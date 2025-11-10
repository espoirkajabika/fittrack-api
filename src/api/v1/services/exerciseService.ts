import { ExerciseRepository } from "../repositories/exerciseRepository";
import { Exercise, CreateExerciseDto, UpdateExerciseDto } from "../models/exercise";

/**
 * Exercise Service
 * Contains business logic for exercise operations
 */
export class ExerciseService {
  private exerciseRepository: ExerciseRepository;

  constructor() {
    this.exerciseRepository = new ExerciseRepository();
  }

  /**
   * Create a new exercise
   * Only trainers, coaches, and admins can create exercises
   */
  async createExercise(
    userId: string,
    exerciseData: CreateExerciseDto
  ): Promise<Exercise> {
    return await this.exerciseRepository.create(userId, exerciseData);
  }

  /**
   * Get exercise by ID
   * All authenticated users can view exercises
   */
  async getExerciseById(exerciseId: string): Promise<Exercise> {
    return await this.exerciseRepository.findById(exerciseId);
  }

  /**
   * Get all exercises with optional filters
   * All authenticated users can browse exercises
   */
  async getAllExercises(filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    return await this.exerciseRepository.findAll(filters);
  }

  /**
   * Update an exercise
   * Only trainers, coaches, and admins can update exercises
   */
  async updateExercise(
    exerciseId: string,
    updateData: UpdateExerciseDto
  ): Promise<Exercise> {
    return await this.exerciseRepository.update(exerciseId, updateData);
  }

  /**
   * Delete an exercise
   * Only admins can delete exercises
   */
  async deleteExercise(exerciseId: string): Promise<void> {
    await this.exerciseRepository.delete(exerciseId);
  }

  /**
   * Search exercises by name
   */
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    return await this.exerciseRepository.findAll({ search: searchTerm });
  }

  /**
   * Get exercises by muscle group
   */
  async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return await this.exerciseRepository.findAll({ muscleGroup });
  }

  /**
   * Get exercises by equipment
   */
  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    return await this.exerciseRepository.findAll({ equipment });
  }
}
