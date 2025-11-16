import { WorkoutExercise } from "./workout";

/**
 * Individual workout within a plan
 */
export interface PlanWorkout {
  weekNumber: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  name: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

/**
 * Workout Plan model
 * Represents a structured program like "6-Week Beginner" or "Advanced Powerlifting"
 */
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in weeks
  difficulty: "beginner" | "intermediate" | "advanced";
  workouts: PlanWorkout[];
  createdBy: string; // userId of trainer/admin who created it
  isPublic: boolean; // Whether the plan is visible to all users
  enrolledCount: number; // Number of users enrolled
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data for creating a new workout plan
 */
export interface CreateWorkoutPlanDto {
  name: string;
  description: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  workouts: PlanWorkout[];
  isPublic?: boolean;
}

/**
 * Data for updating a workout plan
 */
export interface UpdateWorkoutPlanDto {
  name?: string;
  description?: string;
  duration?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  workouts?: PlanWorkout[];
  isPublic?: boolean;
}

/**
 * User enrollment in a workout plan
 */
export interface WorkoutPlanEnrollment {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  status: "active" | "completed" | "cancelled";
  currentWeek: number;
  createdAt: Date;
  updatedAt: Date;
}
