import { WorkoutRepository } from "../../../src/api/v1/repositories/workoutRepository";
import { db } from "../../../src/config/firebaseConfig";
import { mockWorkoutData, mockWorkout, mockUpdateData } from "../../helpers/mockData";
import { NotFoundError } from "../../../src/api/v1/models/errors";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("WorkoutRepository", () => {
  let workoutRepository: WorkoutRepository;
  let mockCollection: any;
  let mockDoc: any;
  let mockGet: any;
  let mockSet: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockWhere: any;
  let mockOrderBy: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    workoutRepository = new WorkoutRepository();

    // Set up mock functions
    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDelete = jest.fn().mockResolvedValue(undefined);
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "workout-123",
      set: mockSet,
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("create", () => {
    it("should create a new workout successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "workout-123",
        data: () => ({
          ...mockWorkoutData,
          userId: "user-456",
          status: "scheduled",
          scheduledDate: mockWorkoutData.scheduledDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await workoutRepository.create("user-456", mockWorkoutData);

      expect(mockCollection).toHaveBeenCalledWith("workouts");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.userId).toBe("user-456");
      expect(result.name).toBe(mockWorkoutData.name);
      expect(result.status).toBe("scheduled");
    });
  });

  describe("findById", () => {
    it("should find a workout by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "workout-123",
        data: () => ({
          userId: mockWorkout.userId,
          name: mockWorkout.name,
          scheduledDate: mockWorkout.scheduledDate.toISOString(),
          status: mockWorkout.status,
          exercises: mockWorkout.exercises,
          notes: mockWorkout.notes,
          createdAt: mockWorkout.createdAt.toISOString(),
          updatedAt: mockWorkout.updatedAt.toISOString(),
        }),
      });

      const result = await workoutRepository.findById("workout-123");

      expect(mockCollection).toHaveBeenCalledWith("workouts");
      expect(mockDoc).toHaveBeenCalledWith("workout-123");
      expect(mockGet).toHaveBeenCalled();
      expect(result.id).toBe("workout-123");
      expect(result.name).toBe(mockWorkout.name);
    });

    it("should throw NotFoundError if workout does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(workoutRepository.findById("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
      await expect(workoutRepository.findById("nonexistent-id")).rejects.toThrow(
        "Workout with ID nonexistent-id not found"
      );
    });
  });

  describe("findByUserId", () => {
    it("should find all workouts for a user", async () => {
      const mockWorkouts = [mockWorkout];
      
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockWorkouts.map((workout) => ({
            id: workout.id,
            data: () => ({
              userId: workout.userId,
              name: workout.name,
              scheduledDate: workout.scheduledDate.toISOString(),
              status: workout.status,
              exercises: workout.exercises,
              notes: workout.notes,
              createdAt: workout.createdAt.toISOString(),
              updatedAt: workout.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      const result = await workoutRepository.findByUserId("user-456");

      expect(mockCollection).toHaveBeenCalledWith("workouts");
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("user-456");
    });

    it("should find workouts with status filter", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await workoutRepository.findByUserId("user-456", { status: "completed" });

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "completed");
    });
  });

  describe("update", () => {
    it("should update a workout successfully", async () => {
      // Mock the get call for checking existence
      mockGet.mockResolvedValueOnce({
        exists: true,
      });

      // Mock the get call for returning updated workout
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "workout-123",
        data: () => ({
          userId: mockWorkout.userId,
          name: mockWorkout.name,
          scheduledDate: mockWorkout.scheduledDate.toISOString(),
          status: "completed",
          exercises: mockWorkout.exercises,
          notes: "Great workout!",
          duration: 45,
          createdAt: mockWorkout.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await workoutRepository.update("workout-123", mockUpdateData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.status).toBe("completed");
    });

    it("should throw NotFoundError if workout does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        workoutRepository.update("nonexistent-id", mockUpdateData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete a workout successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      });

      await workoutRepository.delete("workout-123");

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if workout does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(workoutRepository.delete("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("belongsToUser", () => {
    it("should return true if workout belongs to user", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "workout-123",
        data: () => ({
          userId: "user-456",
          name: mockWorkout.name,
          scheduledDate: mockWorkout.scheduledDate.toISOString(),
          status: mockWorkout.status,
          exercises: mockWorkout.exercises,
          createdAt: mockWorkout.createdAt.toISOString(),
          updatedAt: mockWorkout.updatedAt.toISOString(),
        }),
      });

      const result = await workoutRepository.belongsToUser("workout-123", "user-456");

      expect(result).toBe(true);
    });

    it("should return false if workout does not belong to user", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "workout-123",
        data: () => ({
          userId: "different-user",
          name: mockWorkout.name,
          scheduledDate: mockWorkout.scheduledDate.toISOString(),
          status: mockWorkout.status,
          exercises: mockWorkout.exercises,
          createdAt: mockWorkout.createdAt.toISOString(),
          updatedAt: mockWorkout.updatedAt.toISOString(),
        }),
      });

      const result = await workoutRepository.belongsToUser("workout-123", "user-456");

      expect(result).toBe(false);
    });
  });
});
