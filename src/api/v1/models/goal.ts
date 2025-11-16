/**
 * Goal types
 */
export type GoalType =
  | "weight"
  | "body_fat"
  | "strength"
  | "workout_frequency"
  | "custom";

/**
 * Goal status
 */
export type GoalStatus = "active" | "completed" | "abandoned" | "expired";

/**
 * Target details for strength goals
 */
export interface StrengthGoalTarget {
  exerciseId: string;
  exerciseName: string;
  targetWeight: number;
  targetReps: number;
}

/**
 * Target details for workout frequency goals
 */
export interface WorkoutFrequencyTarget {
  workoutsPerWeek?: number;
  workoutsPerMonth?: number;
}

/**
 * Fitness Goal
 */
export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;

  // Target values (type-dependent)
  targetWeight?: number; // For weight goals
  targetBodyFat?: number; // For body fat goals
  strengthTarget?: StrengthGoalTarget; // For strength goals
  frequencyTarget?: WorkoutFrequencyTarget; // For workout frequency goals
  customTarget?: string; // For custom goals

  // Current values
  startValue?: number; // Starting weight/body fat
  currentValue?: number; // Current weight/body fat
  currentProgress?: number; // Progress percentage (0-100)

  // Dates
  startDate: Date;
  deadline: Date;
  completedAt?: Date;

  // Status
  status: GoalStatus;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for creating a goal
 */
export interface CreateGoalDto {
  type: GoalType;
  title: string;
  description?: string;
  targetWeight?: number;
  targetBodyFat?: number;
  strengthTarget?: StrengthGoalTarget;
  frequencyTarget?: WorkoutFrequencyTarget;
  customTarget?: string;
  startValue?: number;
  deadline: Date;
}

/**
 * Data for updating a goal
 */
export interface UpdateGoalDto {
  title?: string;
  description?: string;
  targetWeight?: number;
  targetBodyFat?: number;
  strengthTarget?: StrengthGoalTarget;
  frequencyTarget?: WorkoutFrequencyTarget;
  customTarget?: string;
  deadline?: Date;
  status?: GoalStatus;
}

/**
 * Goal progress update
 */
export interface GoalProgressUpdate {
  currentValue?: number;
  currentProgress?: number;
}

/**
 * Goal statistics
 */
export interface GoalStatistics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  abandonedGoals: number;
  completionRate: number;
  averageDaysToComplete: number;
  goalsByType: {
    [key in GoalType]: number;
  };
}
