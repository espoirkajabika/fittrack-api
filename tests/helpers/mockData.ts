import { Workout, CreateWorkoutDto, UpdateWorkoutDto } from "../../src/api/v1/models/workout";

export const mockWorkoutData: CreateWorkoutDto = {
  name: "Test Workout",
  scheduledDate: new Date("2025-11-10T10:00:00Z"),
  exercises: [
    {
      exerciseId: "bench-press",
      sets: 3,
      reps: 10,
      weight: 135,
    },
    {
      exerciseId: "squats",
      sets: 4,
      reps: 8,
      weight: 185,
    },
  ],
  notes: "Test workout notes",
};

export const mockWorkout: Workout = {
  id: "workout-123",
  userId: "user-456",
  name: "Test Workout",
  scheduledDate: new Date("2025-11-10T10:00:00Z"),
  status: "scheduled",
  exercises: [
    {
      exerciseId: "bench-press",
      sets: 3,
      reps: 10,
      weight: 135,
    },
  ],
  notes: "Test workout notes",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockUpdateData: UpdateWorkoutDto = {
  status: "completed",
  duration: 45,
  notes: "Great workout!",
};
