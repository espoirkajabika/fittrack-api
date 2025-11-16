import { ProgressService } from "../../../src/api/v1/services/progressService";
import { ProgressRepository } from "../../../src/api/v1/repositories/progressRepository";
import { WorkoutRepository } from "../../../src/api/v1/repositories/workoutRepository";
import {
  mockCompleteWorkoutData,
  mockWorkoutProgress,
  mockPersonalRecord,
  mockCreateBodyMetricsData,
  mockBodyMetrics,
  mockUpdateBodyMetricsData,
  mockExerciseProgressStats,
} from "../../helpers/progressMockData";
import { mockWorkout } from "../../helpers/mockData";
import { AuthorizationError } from "../../../src/api/v1/models/errors";

// Mock Firebase config
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock repositories
jest.mock("../../../src/api/v1/repositories/progressRepository");
jest.mock("../../../src/api/v1/repositories/workoutRepository");

describe("ProgressService", () => {
  let progressService: ProgressService;
  let mockProgressRepository: jest.Mocked<ProgressRepository>;
  let mockWorkoutRepository: jest.Mocked<WorkoutRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    progressService = new ProgressService();
    mockProgressRepository = (
      ProgressRepository as jest.MockedClass<typeof ProgressRepository>
    ).mock.instances[0] as jest.Mocked<ProgressRepository>;
    mockWorkoutRepository = (
      WorkoutRepository as jest.MockedClass<typeof WorkoutRepository>
    ).mock.instances[0] as jest.Mocked<WorkoutRepository>;
  });

  describe("completeWorkout", () => {
    it("should complete a workout and detect personal records", async () => {
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(mockWorkout);
      mockProgressRepository.logWorkoutCompletion = jest
        .fn()
        .mockResolvedValue(mockWorkoutProgress);
      mockProgressRepository.upsertPersonalRecord = jest
        .fn()
        .mockResolvedValue(mockPersonalRecord);
      mockProgressRepository.findPersonalRecordsByUser = jest
        .fn()
        .mockResolvedValue([mockPersonalRecord]);
      mockWorkoutRepository.update = jest.fn().mockResolvedValue(mockWorkout);

      const result = await progressService.completeWorkout(
        "user-456",
        "workout-789",
        mockCompleteWorkoutData
      );

      expect(mockWorkoutRepository.findById).toHaveBeenCalledWith("workout-789");
      expect(mockProgressRepository.logWorkoutCompletion).toHaveBeenCalled();
      expect(mockWorkoutRepository.update).toHaveBeenCalledWith("workout-789", {
        status: "completed",
        duration: 45,
      });
      expect(result.workoutProgress).toEqual(mockWorkoutProgress);
    });

    it("should throw AuthorizationError if workout doesn't belong to user", async () => {
      const otherUserWorkout = { ...mockWorkout, userId: "other-user" };
      mockWorkoutRepository.findById = jest.fn().mockResolvedValue(otherUserWorkout);

      await expect(
        progressService.completeWorkout("user-456", "workout-789", mockCompleteWorkoutData)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getWorkoutProgressById", () => {
    it("should get workout progress for the owner", async () => {
      mockProgressRepository.findWorkoutProgressById = jest
        .fn()
        .mockResolvedValue(mockWorkoutProgress);

      const result = await progressService.getWorkoutProgressById(
        "progress-123",
        "user-456",
        "user"
      );

      expect(result).toEqual(mockWorkoutProgress);
    });

    it("should allow trainers to view any user's progress", async () => {
      mockProgressRepository.findWorkoutProgressById = jest
        .fn()
        .mockResolvedValue(mockWorkoutProgress);

      const result = await progressService.getWorkoutProgressById(
        "progress-123",
        "trainer-123",
        "trainer"
      );

      expect(result).toEqual(mockWorkoutProgress);
    });

    it("should throw AuthorizationError for unauthorized users", async () => {
      mockProgressRepository.findWorkoutProgressById = jest
        .fn()
        .mockResolvedValue(mockWorkoutProgress);

      await expect(
        progressService.getWorkoutProgressById("progress-123", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getWorkoutProgressHistory", () => {
    it("should get workout progress history for own user", async () => {
      const history = [mockWorkoutProgress];
      mockProgressRepository.findWorkoutProgressByUser = jest
        .fn()
        .mockResolvedValue(history);

      const result = await progressService.getWorkoutProgressHistory(
        "user-456",
        "user-456",
        "user"
      );

      expect(result).toEqual(history);
    });

    it("should throw AuthorizationError for other users", async () => {
      await expect(
        progressService.getWorkoutProgressHistory("user-456", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getPersonalRecords", () => {
    it("should get personal records for own user", async () => {
      const records = [mockPersonalRecord];
      mockProgressRepository.findPersonalRecordsByUser = jest
        .fn()
        .mockResolvedValue(records);

      const result = await progressService.getPersonalRecords(
        "user-456",
        "user-456",
        "user"
      );

      expect(result).toEqual(records);
    });
  });

  describe("getExerciseProgress", () => {
    it("should get exercise progress stats", async () => {
      mockProgressRepository.getExerciseProgressStats = jest
        .fn()
        .mockResolvedValue(mockExerciseProgressStats);

      const result = await progressService.getExerciseProgress(
        "user-456",
        "bench-press",
        "user-456",
        "user"
      );

      expect(result).toEqual(mockExerciseProgressStats);
    });
  });

  describe("logBodyMetrics", () => {
    it("should log body metrics", async () => {
      mockProgressRepository.createBodyMetrics = jest
        .fn()
        .mockResolvedValue(mockBodyMetrics);

      const result = await progressService.logBodyMetrics(
        "user-456",
        mockCreateBodyMetricsData
      );

      expect(result).toEqual(mockBodyMetrics);
    });
  });

  describe("getBodyMetricsById", () => {
    it("should get body metrics for owner", async () => {
      mockProgressRepository.findBodyMetricsById = jest
        .fn()
        .mockResolvedValue(mockBodyMetrics);

      const result = await progressService.getBodyMetricsById(
        "metrics-123",
        "user-456",
        "user"
      );

      expect(result).toEqual(mockBodyMetrics);
    });

    it("should throw AuthorizationError for other users", async () => {
      mockProgressRepository.findBodyMetricsById = jest
        .fn()
        .mockResolvedValue(mockBodyMetrics);

      await expect(
        progressService.getBodyMetricsById("metrics-123", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("updateBodyMetrics", () => {
    it("should update body metrics", async () => {
      const updatedMetrics = { ...mockBodyMetrics, weight: 74.8 };
      mockProgressRepository.findBodyMetricsById = jest
        .fn()
        .mockResolvedValue(mockBodyMetrics);
      mockProgressRepository.updateBodyMetrics = jest
        .fn()
        .mockResolvedValue(updatedMetrics);

      const result = await progressService.updateBodyMetrics(
        "metrics-123",
        "user-456",
        mockUpdateBodyMetricsData
      );

      expect(result).toEqual(updatedMetrics);
    });
  });

  describe("deleteBodyMetrics", () => {
    it("should delete body metrics", async () => {
      mockProgressRepository.findBodyMetricsById = jest
        .fn()
        .mockResolvedValue(mockBodyMetrics);
      mockProgressRepository.deleteBodyMetrics = jest.fn().mockResolvedValue(undefined);

      await progressService.deleteBodyMetrics("metrics-123", "user-456");

      expect(mockProgressRepository.deleteBodyMetrics).toHaveBeenCalledWith("metrics-123");
    });
  });

  describe("getWorkoutStats", () => {
    it("should get workout statistics", async () => {
      const progressHistory = [
        mockWorkoutProgress,
        { ...mockWorkoutProgress, id: "progress-456", rating: 5 },
      ];
      mockProgressRepository.findWorkoutProgressByUser = jest
        .fn()
        .mockResolvedValue(progressHistory);

      const result = await progressService.getWorkoutStats("user-456", "user-456", "user");

      expect(result.totalWorkouts).toBe(2);
      expect(result.totalDuration).toBe(90);
      expect(result.averageDuration).toBe(45);
      expect(result.averageRating).toBe(4.5);
    });
  });
});
