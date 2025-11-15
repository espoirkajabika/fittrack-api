import {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalStatistics,
} from "../../src/api/v1/models/goal";

export const mockCreateWeightGoalData: CreateGoalDto = {
  type: "weight",
  title: "Lose 10 pounds",
  description: "Get down to target weight for summer",
  targetWeight: 70,
  startValue: 80,
  deadline: new Date("2025-12-31"),
};

export const mockWeightGoal: Goal = {
  id: "goal-123",
  userId: "user-456",
  type: "weight",
  title: "Lose 10 pounds",
  description: "Get down to target weight for summer",
  targetWeight: 70,
  startValue: 80,
  currentValue: 80,
  currentProgress: 0,
  startDate: new Date("2025-11-09T08:00:00Z"),
  deadline: new Date("2025-12-31T00:00:00Z"),
  status: "active",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockCreateStrengthGoalData: CreateGoalDto = {
  type: "strength",
  title: "Bench press 225 lbs",
  description: "Hit two plates on bench press",
  strengthTarget: {
    exerciseId: "bench-press",
    exerciseName: "Barbell Bench Press",
    targetWeight: 225,
    targetReps: 5,
  },
  deadline: new Date("2026-06-01"),
};

export const mockStrengthGoal: Goal = {
  id: "goal-456",
  userId: "user-456",
  type: "strength",
  title: "Bench press 225 lbs",
  description: "Hit two plates on bench press",
  strengthTarget: {
    exerciseId: "bench-press",
    exerciseName: "Barbell Bench Press",
    targetWeight: 225,
    targetReps: 5,
  },
  currentProgress: 0,
  startDate: new Date("2025-11-09T08:00:00Z"),
  deadline: new Date("2026-06-01T00:00:00Z"),
  status: "active",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockCreateFrequencyGoalData: CreateGoalDto = {
  type: "workout_frequency",
  title: "Work out 4 times per week",
  description: "Build consistent workout habit",
  frequencyTarget: {
    workoutsPerWeek: 4,
  },
  deadline: new Date("2025-12-31"),
};

export const mockFrequencyGoal: Goal = {
  id: "goal-789",
  userId: "user-456",
  type: "workout_frequency",
  title: "Work out 4 times per week",
  description: "Build consistent workout habit",
  frequencyTarget: {
    workoutsPerWeek: 4,
  },
  currentProgress: 0,
  startDate: new Date("2025-11-09T08:00:00Z"),
  deadline: new Date("2025-12-31T00:00:00Z"),
  status: "active",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockUpdateGoalData: UpdateGoalDto = {
  title: "Lose 15 pounds",
  targetWeight: 65,
  description: "Updated goal with more ambitious target",
};

export const mockGoalStatistics: GoalStatistics = {
  totalGoals: 10,
  activeGoals: 3,
  completedGoals: 5,
  abandonedGoals: 2,
  completionRate: 50,
  averageDaysToComplete: 45,
  goalsByType: {
    weight: 3,
    body_fat: 2,
    strength: 3,
    workout_frequency: 1,
    custom: 1,
  },
};

export const mockGoals: Goal[] = [
  mockWeightGoal,
  mockStrengthGoal,
  mockFrequencyGoal,
];
