import { ExerciseService } from "../../../src/api/v1/services/exerciseService";
import { ExerciseRepository } from "../../../src/api/v1/repositories/exerciseRepository";
import {
  mockExerciseData,
  mockExercise,
  mockUpdateExerciseData,
  mockExercises,
} from "../../helpers/exerciseMockData";

// Mock Firebase config BEFORE importing anything that uses it
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock the repository
jest.mock("../../../src/api/v1/repositories/exerciseRepository");

describe("ExerciseService", () => {
  let exerciseService: ExerciseService;
  let mockExerciseRepository: jest.Mocked<ExerciseRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    exerciseService = new ExerciseService();
    mockExerciseRepository = (
      ExerciseRepository as jest.MockedClass<typeof ExerciseRepository>
    ).mock.instances[0] as jest.Mocked<ExerciseRepository>;
  });

  describe("createExercise", () => {
    it("should create an exercise successfully", async () => {
      mockExerciseRepository.create = jest.fn().mockResolvedValue(mockExercise);

      const result = await exerciseService.createExercise("trainer-456", mockExerciseData);

      expect(mockExerciseRepository.create).toHaveBeenCalledWith(
        "trainer-456",
        mockExerciseData
      );
      expect(result).toEqual(mockExercise);
    });
  });

  describe("getExerciseById", () => {
    it("should get an exercise by ID", async () => {
      mockExerciseRepository.findById = jest.fn().mockResolvedValue(mockExercise);

      const result = await exerciseService.getExerciseById("exercise-123");

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith("exercise-123");
      expect(result).toEqual(mockExercise);
    });
  });

  describe("getAllExercises", () => {
    it("should get all exercises", async () => {
      mockExerciseRepository.findAll = jest.fn().mockResolvedValue(mockExercises);

      const result = await exerciseService.getAllExercises();

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockExercises);
    });

    it("should get exercises with filters", async () => {
      const filters = { category: "strength", difficulty: "intermediate" };
      mockExerciseRepository.findAll = jest.fn().mockResolvedValue(mockExercises);

      const result = await exerciseService.getAllExercises(filters);

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockExercises);
    });
  });

  describe("updateExercise", () => {
    it("should update an exercise successfully", async () => {
      const updatedExercise = { ...mockExercise, difficulty: "advanced" as const };
      mockExerciseRepository.update = jest.fn().mockResolvedValue(updatedExercise);

      const result = await exerciseService.updateExercise(
        "exercise-123",
        mockUpdateExerciseData
      );

      expect(mockExerciseRepository.update).toHaveBeenCalledWith(
        "exercise-123",
        mockUpdateExerciseData
      );
      expect(result).toEqual(updatedExercise);
    });
  });

  describe("deleteExercise", () => {
    it("should delete an exercise successfully", async () => {
      mockExerciseRepository.delete = jest.fn().mockResolvedValue(undefined);

      await exerciseService.deleteExercise("exercise-123");

      expect(mockExerciseRepository.delete).toHaveBeenCalledWith("exercise-123");
    });
  });

  describe("searchExercises", () => {
    it("should search exercises by name", async () => {
      const searchResults = [mockExercise];
      mockExerciseRepository.findAll = jest.fn().mockResolvedValue(searchResults);

      const result = await exerciseService.searchExercises("bench");

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith({ search: "bench" });
      expect(result).toEqual(searchResults);
    });
  });

  describe("getExercisesByMuscleGroup", () => {
    it("should get exercises by muscle group", async () => {
      const chestExercises = mockExercises.filter((e) =>
        e.muscleGroups.includes("chest")
      );
      mockExerciseRepository.findAll = jest.fn().mockResolvedValue(chestExercises);

      const result = await exerciseService.getExercisesByMuscleGroup("chest");

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith({
        muscleGroup: "chest",
      });
      expect(result).toEqual(chestExercises);
    });
  });

  describe("getExercisesByEquipment", () => {
    it("should get exercises by equipment", async () => {
      const barbellExercises = mockExercises.filter((e) =>
        e.equipment.includes("barbell")
      );
      mockExerciseRepository.findAll = jest.fn().mockResolvedValue(barbellExercises);

      const result = await exerciseService.getExercisesByEquipment("barbell");

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith({
        equipment: "barbell",
      });
      expect(result).toEqual(barbellExercises);
    });
  });
});
