/**
 * Exercise in a workout
 */
export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

/**
 * Workout model
 */
export interface Workout {
  id: string;
  userId: string;
  name: string;
  scheduledDate: Date;
  status: "scheduled" | "completed" | "skipped";
  exercises: WorkoutExercise[];
  notes?: string;
  duration?: number; // Duration in minutes
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for creating a new workout
 */
export interface CreateWorkoutDto {
  name: string;
  scheduledDate: Date;
  exercises: WorkoutExercise[];
  notes?: string;
}

/**
 * Data for updating a workout
 */
export interface UpdateWorkoutDto {
  name?: string;
  scheduledDate?: Date;
  status?: "scheduled" | "completed" | "skipped";
  exercises?: WorkoutExercise[];
  notes?: string;
  duration?: number;
}
