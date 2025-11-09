import { WorkoutService } from "../../../src/api/v1/services/workoutService";
import { WorkoutRepository } from "../../../src/api/v1/repositories/workoutRepository";
import { mockWorkoutData, mockWorkout, mockUpdateData } from "../../helpers/mockData";
import { AuthorizationError } from "../../../src/api/v1/models/errors";

// Mock Firebase config BEFORE importing anything that uses it
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock the repository
jest.mock("../../../src/api/v1/repositories/workoutRepository");

describe("WorkoutService", () => {
  let workoutService: WorkoutService;
  let mockWorkoutRepository: jest.Mocked<WorkoutRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    workoutService = new WorkoutService();
    mockWorkoutRepository = (WorkoutRepository as jest.MockedClass<typeof WorkoutRepository>).mock
      .instances[0] as jest.Mocked<WorkoutRepository>;
  });

  describe("createWorkout", () => {
    it("should create a workout successfully", async () => {
      mockWorkoutRepository.create = jest.fn().mockResolvedValue(mockWorkout);

      const result = await workoutService.createWorkout("user-456", mockWorkoutData);

      expect(mockWorkoutRepository.create).toHaveBeenCalledWith("user-456", mockWorkoutData);
      expect(result).toEqual(mockWorkout);
    });
  });

  describe("getWorkoutById", () => {
    it("should allow user to view their own workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);

      const result = await workoutService.getWorkoutById("workout-123", "user-456", "user");

      expect(mockWorkoutRepository.findById).toHaveBeenCalledWith("workout-123");
      expect(result).toEqual(mockWorkout);
    });

    it("should allow trainer to view any workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);

      const result = await workoutService.getWorkoutById(
        "workout-123",
        "different-user",
        "trainer"
      );

      expect(result).toEqual(mockWorkout);
    });

    it("should throw AuthorizationError if user tries to view another user's workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);

      await expect(
        workoutService.getWorkoutById("workout-123", "different-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getUserWorkouts", () => {
    it("should get all workouts for a user", async () => {
      const mockWorkouts = [mockWorkout];
      mockWorkoutRepository.findByUserId = jest.fn().mockResolvedValue(mockWorkouts);

      const result = await workoutService.getUserWorkouts("user-456");

      expect(mockWorkoutRepository.findByUserId).toHaveBeenCalledWith("user-456", undefined);
      expect(result).toEqual(mockWorkouts);
    });

    it("should get workouts with filters", async () => {
      const mockWorkouts = [mockWorkout];
      const filters = { status: "completed" };
      mockWorkoutRepository.findByUserId = jest.fn().mockResolvedValue(mockWorkouts);

      const result = await workoutService.getUserWorkouts("user-456", filters);

      expect(mockWorkoutRepository.findByUserId).toHaveBeenCalledWith("user-456", filters);
      expect(result).toEqual(mockWorkouts);
    });
  });

  describe("updateWorkout", () => {
    it("should allow user to update their own workout", async () => {
      const updatedWorkout = { ...mockWorkout, status: "completed" as const };
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);
      mockWorkoutRepository.update = jest.fn().mockResolvedValue(updatedWorkout);

      const result = await workoutService.updateWorkout(
        "workout-123",
        "user-456",
        "user",
        mockUpdateData
      );

      expect(mockWorkoutRepository.update).toHaveBeenCalledWith("workout-123", mockUpdateData);
      expect(result).toEqual(updatedWorkout);
    });

    it("should allow admin to update any workout", async () => {
      const updatedWorkout = { ...mockWorkout, status: "completed" as const };
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);
      mockWorkoutRepository.update = jest.fn().mockResolvedValue(updatedWorkout);

      const result = await workoutService.updateWorkout(
        "workout-123",
        "different-user",
        "admin",
        mockUpdateData
      );

      expect(result).toEqual(updatedWorkout);
    });

    it("should throw AuthorizationError if user tries to update another user's workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);

      await expect(
        workoutService.updateWorkout("workout-123", "different-user", "user", mockUpdateData)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("deleteWorkout", () => {
    it("should allow user to delete their own workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);
      mockWorkoutRepository.delete = jest.fn().mockResolvedValue(undefined);

      await workoutService.deleteWorkout("workout-123", "user-456", "user");

      expect(mockWorkoutRepository.delete).toHaveBeenCalledWith("workout-123");
    });

    it("should allow admin to delete any workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);
      mockWorkoutRepository.delete = jest.fn().mockResolvedValue(undefined);

      await workoutService.deleteWorkout("workout-123", "different-user", "admin");

      expect(mockWorkoutRepository.delete).toHaveBeenCalledWith("workout-123");
    });

    it("should throw AuthorizationError if trainer tries to delete workout", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);

      await expect(
        workoutService.deleteWorkout("workout-123", "different-user", "trainer")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getWorkoutStats", () => {
    it("should calculate workout statistics correctly", async () => {
      const mockWorkouts = [
        { ...mockWorkout, status: "completed" as const },
        { ...mockWorkout, id: "workout-2", status: "completed" as const },
        { ...mockWorkout, id: "workout-3", status: "scheduled" as const },
        { ...mockWorkout, id: "workout-4", status: "skipped" as const },
      ];
      mockWorkoutRepository.findByUserId = jest.fn().mockResolvedValue(mockWorkouts);

      const result = await workoutService.getWorkoutStats("user-456");

      expect(result).toEqual({
        total: 4,
        completed: 2,
        scheduled: 1,
        skipped: 1,
      });
    });

    it("should return zeros for user with no workouts", async () => {
      mockWorkoutRepository.findByUserId = jest.fn().mockResolvedValue([]);

      const result = await workoutService.getWorkoutStats("user-456");

      expect(result).toEqual({
        total: 0,
        completed: 0,
        scheduled: 0,
        skipped: 0,
      });
    });
  });
});
