/**
 * Exercise progress within a workout
 * Tracks actual performance vs planned
 */
export interface ExerciseProgress {
  exerciseId: string;
  exerciseName?: string; // Denormalized for easier querying
  plannedSets: number;
  completedSets: number;
  plannedReps: number;
  actualReps: number[];
  plannedWeight?: number;
  actualWeight: number[];
  notes?: string;
}

/**
 * Workout completion/progress record
 */
export interface WorkoutProgress {
  id: string;
  userId: string;
  workoutId: string;
  workoutName?: string; // Denormalized
  completedAt: Date;
  duration: number; // Duration in minutes
  exercises: ExerciseProgress[];
  overallNotes?: string;
  rating?: number; // 1-5 difficulty/satisfaction rating
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Body measurements and metrics
 */
export interface BodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight?: number; // in kg or lbs
  bodyFat?: number; // percentage
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    thighs?: number;
    arms?: number;
    neck?: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Personal record for an exercise
 */
export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName?: string; // Denormalized
  weight: number;
  reps: number;
  achievedAt: Date;
  workoutProgressId?: string; // Reference to the workout where this was achieved
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for completing a workout
 */
export interface CompleteWorkoutDto {
  duration: number;
  exercises: ExerciseProgress[];
  overallNotes?: string;
  rating?: number;
}

/**
 * Data for logging body metrics
 */
export interface CreateBodyMetricsDto {
  date?: Date;
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    thighs?: number;
    arms?: number;
    neck?: number;
  };
  notes?: string;
}

/**
 * Update body metrics
 */
export interface UpdateBodyMetricsDto {
  weight?: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    thighs?: number;
    arms?: number;
    neck?: number;
  };
  notes?: string;
}

/**
 * Progress statistics for an exercise
 */
export interface ExerciseProgressStats {
  exerciseId: string;
  exerciseName: string;
  totalWorkouts: number;
  firstRecorded: Date;
  lastRecorded: Date;
  personalRecord: {
    weight: number;
    reps: number;
    achievedAt: Date;
  };
  progressData: Array<{
    date: Date;
    weight: number;
    reps: number;
    volume: number; // weight * reps * sets
  }>;
}
