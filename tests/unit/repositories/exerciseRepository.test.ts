import { ExerciseRepository } from "../../../src/api/v1/repositories/exerciseRepository";
import { db } from "../../../src/config/firebaseConfig";
import {
  mockExerciseData,
  mockExercise,
  mockUpdateExerciseData,
  mockExercises,
} from "../../helpers/exerciseMockData";
import { NotFoundError } from "../../../src/api/v1/models/errors";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("ExerciseRepository", () => {
  let exerciseRepository: ExerciseRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    exerciseRepository = new ExerciseRepository();

    // Set up mock functions
    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDelete = jest.fn().mockResolvedValue(undefined);
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "exercise-123",
      set: mockSet,
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    });

    // Setup orderBy to return an object with get
    mockOrderBy.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [],
      }),
    });

    // Setup where to return an object with where and orderBy
    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy, // Add orderBy directly to collection
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("create", () => {
    it("should create a new exercise successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "exercise-123",
        data: () => ({
          ...mockExerciseData,
          createdBy: "trainer-456",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await exerciseRepository.create("trainer-456", mockExerciseData);

      expect(mockCollection).toHaveBeenCalledWith("exercises");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.createdBy).toBe("trainer-456");
      expect(result.name).toBe(mockExerciseData.name);
      expect(result.category).toBe(mockExerciseData.category);
    });
  });

  describe("findById", () => {
    it("should find an exercise by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "exercise-123",
        data: () => ({
          name: mockExercise.name,
          category: mockExercise.category,
          muscleGroups: mockExercise.muscleGroups,
          equipment: mockExercise.equipment,
          difficulty: mockExercise.difficulty,
          instructions: mockExercise.instructions,
          imageUrl: mockExercise.imageUrl,
          videoUrl: mockExercise.videoUrl,
          createdBy: mockExercise.createdBy,
          createdAt: mockExercise.createdAt.toISOString(),
          updatedAt: mockExercise.updatedAt.toISOString(),
        }),
      });

      const result = await exerciseRepository.findById("exercise-123");

      expect(mockCollection).toHaveBeenCalledWith("exercises");
      expect(mockDoc).toHaveBeenCalledWith("exercise-123");
      expect(mockGet).toHaveBeenCalled();
      expect(result.id).toBe("exercise-123");
      expect(result.name).toBe(mockExercise.name);
    });

    it("should throw NotFoundError if exercise does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(exerciseRepository.findById("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
      await expect(exerciseRepository.findById("nonexistent-id")).rejects.toThrow(
        "Exercise with ID nonexistent-id not found"
      );
    });
  });

  describe("findAll", () => {
    it("should find all exercises", async () => {
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockExercises.map((exercise) => ({
            id: exercise.id,
            data: () => ({
              name: exercise.name,
              category: exercise.category,
              muscleGroups: exercise.muscleGroups,
              equipment: exercise.equipment,
              difficulty: exercise.difficulty,
              instructions: exercise.instructions,
              imageUrl: exercise.imageUrl,
              videoUrl: exercise.videoUrl,
              createdBy: exercise.createdBy,
              createdAt: exercise.createdAt.toISOString(),
              updatedAt: exercise.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const result = await exerciseRepository.findAll();

      expect(mockCollection).toHaveBeenCalledWith("exercises");
      expect(mockOrderBy).toHaveBeenCalledWith("name", "asc");
      expect(result).toHaveLength(3);
    });

    it("should find exercises with category filter", async () => {
      const strengthExercises = mockExercises.filter((e) => e.category === "strength");

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: strengthExercises.map((exercise) => ({
            id: exercise.id,
            data: () => ({
              name: exercise.name,
              category: exercise.category,
              muscleGroups: exercise.muscleGroups,
              equipment: exercise.equipment,
              difficulty: exercise.difficulty,
              instructions: exercise.instructions,
              createdBy: exercise.createdBy,
              createdAt: exercise.createdAt.toISOString(),
              updatedAt: exercise.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const result = await exerciseRepository.findAll({ category: "strength" });

      expect(mockWhere).toHaveBeenCalledWith("category", "==", "strength");
      expect(result.every((e) => e.category === "strength")).toBe(true);
    });

    it("should find exercises with muscle group filter", async () => {
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await exerciseRepository.findAll({ muscleGroup: "chest" });

      expect(mockWhere).toHaveBeenCalledWith("muscleGroups", "array-contains", "chest");
    });

    it("should find exercises with equipment filter", async () => {
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await exerciseRepository.findAll({ equipment: "barbell" });

      expect(mockWhere).toHaveBeenCalledWith("equipment", "array-contains", "barbell");
    });

    it("should find exercises with difficulty filter", async () => {
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await exerciseRepository.findAll({ difficulty: "beginner" });

      expect(mockWhere).toHaveBeenCalledWith("difficulty", "==", "beginner");
    });

    it("should search exercises by name", async () => {
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockExercises.map((exercise) => ({
            id: exercise.id,
            data: () => ({
              name: exercise.name,
              category: exercise.category,
              muscleGroups: exercise.muscleGroups,
              equipment: exercise.equipment,
              difficulty: exercise.difficulty,
              instructions: exercise.instructions,
              createdBy: exercise.createdBy,
              createdAt: exercise.createdAt.toISOString(),
              updatedAt: exercise.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const result = await exerciseRepository.findAll({ search: "bench" });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name.toLowerCase()).toContain("bench");
    });
  });

  describe("update", () => {
    it("should update an exercise successfully", async () => {
      // Mock the get call for checking existence
      mockGet.mockResolvedValueOnce({
        exists: true,
      });

      // Mock the get call for returning updated exercise
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "exercise-123",
        data: () => ({
          name: mockExercise.name,
          category: mockExercise.category,
          muscleGroups: mockExercise.muscleGroups,
          equipment: mockExercise.equipment,
          difficulty: "advanced",
          instructions: mockUpdateExerciseData.instructions,
          imageUrl: mockExercise.imageUrl,
          videoUrl: mockExercise.videoUrl,
          createdBy: mockExercise.createdBy,
          createdAt: mockExercise.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await exerciseRepository.update("exercise-123", mockUpdateExerciseData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.difficulty).toBe("advanced");
    });

    it("should throw NotFoundError if exercise does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        exerciseRepository.update("nonexistent-id", mockUpdateExerciseData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete an exercise successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      });

      await exerciseRepository.delete("exercise-123");

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if exercise does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(exerciseRepository.delete("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
