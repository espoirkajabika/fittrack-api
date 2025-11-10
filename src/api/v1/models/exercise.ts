/**
 * Exercise model
 * Represents an individual exercise in the library
 */
export interface Exercise {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "balance";
  muscleGroups: string[];
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  createdBy: string; // userId of trainer/admin who created it
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for creating a new exercise
 */
export interface CreateExerciseDto {
  name: string;
  category: "strength" | "cardio" | "flexibility" | "balance";
  muscleGroups: string[];
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Data for updating an exercise
 */
export interface UpdateExerciseDto {
  name?: string;
  category?: "strength" | "cardio" | "flexibility" | "balance";
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  instructions?: string[];
  imageUrl?: string;
  videoUrl?: string;
}
