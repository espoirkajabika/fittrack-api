import {
  WorkoutProgress,
  CompleteWorkoutDto,
  BodyMetrics,
  CreateBodyMetricsDto,
  UpdateBodyMetricsDto,
  PersonalRecord,
  ExerciseProgressStats,
} from "../../src/api/v1/models/progress";

export const mockCompleteWorkoutData: CompleteWorkoutDto = {
  duration: 45,
  exercises: [
    {
      exerciseId: "bench-press",
      exerciseName: "Barbell Bench Press",
      plannedSets: 3,
      completedSets: 3,
      plannedReps: 10,
      actualReps: [10, 9, 8],
      plannedWeight: 135,
      actualWeight: [135, 135, 135],
      notes: "Felt strong today",
    },
    {
      exerciseId: "squats",
      exerciseName: "Barbell Squat",
      plannedSets: 4,
      completedSets: 4,
      plannedReps: 8,
      actualReps: [8, 8, 7, 6],
      plannedWeight: 185,
      actualWeight: [185, 185, 185, 185],
    },
  ],
  overallNotes: "Great workout!",
  rating: 4,
};

export const mockWorkoutProgress: WorkoutProgress = {
  id: "progress-123",
  userId: "user-456",
  workoutId: "workout-789",
  workoutName: "Upper Body Strength",
  completedAt: new Date("2025-11-09T10:00:00Z"),
  duration: 45,
  exercises: mockCompleteWorkoutData.exercises,
  overallNotes: "Great workout!",
  rating: 4,
  createdAt: new Date("2025-11-09T10:00:00Z"),
  updatedAt: new Date("2025-11-09T10:00:00Z"),
};

export const mockPersonalRecord: PersonalRecord = {
  id: "pr-123",
  userId: "user-456",
  exerciseId: "bench-press",
  exerciseName: "Barbell Bench Press",
  weight: 135,
  reps: 10,
  achievedAt: new Date("2025-11-09T10:00:00Z"),
  workoutProgressId: "progress-123",
  createdAt: new Date("2025-11-09T10:00:00Z"),
  updatedAt: new Date("2025-11-09T10:00:00Z"),
};

export const mockCreateBodyMetricsData: CreateBodyMetricsDto = {
  date: new Date("2025-11-09T08:00:00Z"),
  weight: 75.5,
  bodyFat: 15.2,
  measurements: {
    chest: 100,
    waist: 80,
    hips: 95,
    thighs: 58,
    arms: 38,
    neck: 38,
  },
  notes: "Morning weigh-in",
};

export const mockBodyMetrics: BodyMetrics = {
  id: "metrics-123",
  userId: "user-456",
  date: new Date("2025-11-09T08:00:00Z"),
  weight: 75.5,
  bodyFat: 15.2,
  measurements: {
    chest: 100,
    waist: 80,
    hips: 95,
    thighs: 58,
    arms: 38,
    neck: 38,
  },
  notes: "Morning weigh-in",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockUpdateBodyMetricsData: UpdateBodyMetricsDto = {
  weight: 74.8,
  bodyFat: 14.9,
  notes: "Lost some weight",
};

export const mockExerciseProgressStats: ExerciseProgressStats = {
  exerciseId: "bench-press",
  exerciseName: "Barbell Bench Press",
  totalWorkouts: 5,
  firstRecorded: new Date("2025-10-01T10:00:00Z"),
  lastRecorded: new Date("2025-11-09T10:00:00Z"),
  personalRecord: {
    weight: 135,
    reps: 10,
    achievedAt: new Date("2025-11-09T10:00:00Z"),
  },
  progressData: [
    {
      date: new Date("2025-10-01T10:00:00Z"),
      weight: 115,
      reps: 10,
      volume: 3450,
    },
    {
      date: new Date("2025-10-15T10:00:00Z"),
      weight: 125,
      reps: 9,
      volume: 3375,
    },
    {
      date: new Date("2025-11-09T10:00:00Z"),
      weight: 135,
      reps: 10,
      volume: 4050,
    },
  ],
};
