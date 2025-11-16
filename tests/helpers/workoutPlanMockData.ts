import {
  WorkoutPlan,
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  PlanWorkout,
  WorkoutPlanEnrollment,
} from "../../src/api/v1/models/workoutPlan";

export const mockPlanWorkouts: PlanWorkout[] = [
  {
    weekNumber: 1,
    dayOfWeek: 1, // Monday
    name: "Upper Body Strength",
    exercises: [
      {
        exerciseId: "bench-press",
        sets: 3,
        reps: 10,
        weight: 135,
      },
      {
        exerciseId: "rows",
        sets: 3,
        reps: 12,
        weight: 100,
      },
    ],
    notes: "Focus on form",
  },
  {
    weekNumber: 1,
    dayOfWeek: 3, // Wednesday
    name: "Lower Body Strength",
    exercises: [
      {
        exerciseId: "squats",
        sets: 4,
        reps: 8,
        weight: 185,
      },
      {
        exerciseId: "lunges",
        sets: 3,
        reps: 10,
      },
    ],
  },
];

export const mockCreateWorkoutPlanData: CreateWorkoutPlanDto = {
  name: "6-Week Beginner Program",
  description: "A comprehensive program designed for beginners to build strength and endurance",
  duration: 6,
  difficulty: "beginner",
  workouts: mockPlanWorkouts,
  isPublic: true,
};

export const mockWorkoutPlan: WorkoutPlan = {
  id: "plan-123",
  name: "6-Week Beginner Program",
  description: "A comprehensive program designed for beginners to build strength and endurance",
  duration: 6,
  difficulty: "beginner",
  workouts: mockPlanWorkouts,
  createdBy: "trainer-456",
  isPublic: true,
  enrolledCount: 10,
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockUpdateWorkoutPlanData: UpdateWorkoutPlanDto = {
  name: "8-Week Beginner Program",
  duration: 8,
  description: "Extended program with more gradual progression",
};

export const mockWorkoutPlans: WorkoutPlan[] = [
  mockWorkoutPlan,
  {
    id: "plan-456",
    name: "12-Week Advanced Powerlifting",
    description: "Advanced program for experienced lifters focusing on the big three",
    duration: 12,
    difficulty: "advanced",
    workouts: mockPlanWorkouts,
    createdBy: "coach-789",
    isPublic: true,
    enrolledCount: 5,
    createdAt: new Date("2025-11-08T08:00:00Z"),
    updatedAt: new Date("2025-11-08T08:00:00Z"),
  },
];

export const mockEnrollment: WorkoutPlanEnrollment = {
  id: "enrollment-123",
  userId: "user-456",
  planId: "plan-123",
  startDate: new Date("2025-11-09T00:00:00Z"),
  status: "active",
  currentWeek: 1,
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};
