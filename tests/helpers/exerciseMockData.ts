import { Exercise, CreateExerciseDto, UpdateExerciseDto } from "../../src/api/v1/models/exercise";

export const mockExerciseData: CreateExerciseDto = {
  name: "Barbell Bench Press",
  category: "strength",
  muscleGroups: ["chest", "triceps", "shoulders"],
  equipment: ["barbell", "bench"],
  difficulty: "intermediate",
  instructions: [
    "Lie flat on bench",
    "Grip bar slightly wider than shoulders",
    "Lower bar to chest",
    "Press back up to starting position",
  ],
  imageUrl: "https://example.com/bench-press.jpg",
  videoUrl: "https://youtube.com/watch?v=example",
};

export const mockExercise: Exercise = {
  id: "exercise-123",
  name: "Barbell Bench Press",
  category: "strength",
  muscleGroups: ["chest", "triceps", "shoulders"],
  equipment: ["barbell", "bench"],
  difficulty: "intermediate",
  instructions: [
    "Lie flat on bench",
    "Grip bar slightly wider than shoulders",
    "Lower bar to chest",
    "Press back up to starting position",
  ],
  imageUrl: "https://example.com/bench-press.jpg",
  videoUrl: "https://youtube.com/watch?v=example",
  createdBy: "trainer-456",
  createdAt: new Date("2025-11-09T08:00:00Z"),
  updatedAt: new Date("2025-11-09T08:00:00Z"),
};

export const mockUpdateExerciseData: UpdateExerciseDto = {
  difficulty: "advanced",
  instructions: [
    "Lie flat on bench with feet planted",
    "Grip bar slightly wider than shoulders",
    "Lower bar to chest slowly",
    "Press back up explosively",
    "Maintain tight core throughout",
  ],
};

export const mockExercises: Exercise[] = [
  mockExercise,
  {
    id: "exercise-456",
    name: "Barbell Squat",
    category: "strength",
    muscleGroups: ["quads", "glutes", "hamstrings"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    instructions: [
      "Position barbell on upper back",
      "Stand with feet shoulder-width apart",
      "Lower down by bending knees",
      "Drive back up through heels",
    ],
    createdBy: "trainer-456",
    createdAt: new Date("2025-11-09T09:00:00Z"),
    updatedAt: new Date("2025-11-09T09:00:00Z"),
  },
  {
    id: "exercise-789",
    name: "Push-ups",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    instructions: [
      "Start in plank position",
      "Lower body until chest nearly touches floor",
      "Push back up to starting position",
    ],
    createdBy: "trainer-456",
    createdAt: new Date("2025-11-09T10:00:00Z"),
    updatedAt: new Date("2025-11-09T10:00:00Z"),
  },
];
