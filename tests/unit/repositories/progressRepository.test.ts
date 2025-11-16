import { ProgressRepository } from "../../../src/api/v1/repositories/progressRepository";
import { db } from "../../../src/config/firebaseConfig";
import {
  mockCompleteWorkoutData,
  mockWorkoutProgress,
  mockPersonalRecord,
  mockCreateBodyMetricsData,
  mockBodyMetrics,
  mockUpdateBodyMetricsData,
} from "../../helpers/progressMockData";
import { NotFoundError } from "../../../src/api/v1/models/errors";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("ProgressRepository", () => {
  let progressRepository: ProgressRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    progressRepository = new ProgressRepository();

    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDelete = jest.fn().mockResolvedValue(undefined);
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "test-id-123",
      set: mockSet,
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockOrderBy.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [],
      }),
    });

    mockWhere.mockReturnValue({
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockGet,
      limit: jest.fn().mockReturnThis(),
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("logWorkoutCompletion", () => {
    it("should log workout completion successfully", async () => {
      const result = await progressRepository.logWorkoutCompletion(
        "user-456",
        "workout-789",
        "Upper Body",
        mockCompleteWorkoutData
      );

      expect(mockCollection).toHaveBeenCalledWith("workoutProgress");
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.userId).toBe("user-456");
      expect(result.workoutId).toBe("workout-789");
      expect(result.duration).toBe(45);
    });
  });

  describe("findWorkoutProgressById", () => {
    it("should find workout progress by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "progress-123",
        data: () => ({
          userId: mockWorkoutProgress.userId,
          workoutId: mockWorkoutProgress.workoutId,
          workoutName: mockWorkoutProgress.workoutName,
          completedAt: mockWorkoutProgress.completedAt.toISOString(),
          duration: mockWorkoutProgress.duration,
          exercises: mockWorkoutProgress.exercises,
          overallNotes: mockWorkoutProgress.overallNotes,
          rating: mockWorkoutProgress.rating,
          createdAt: mockWorkoutProgress.createdAt.toISOString(),
          updatedAt: mockWorkoutProgress.updatedAt.toISOString(),
        }),
      });

      const result = await progressRepository.findWorkoutProgressById("progress-123");

      expect(result.id).toBe("progress-123");
      expect(result.userId).toBe(mockWorkoutProgress.userId);
    });

    it("should throw NotFoundError if workout progress does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        progressRepository.findWorkoutProgressById("nonexistent-id")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findWorkoutProgressByUser", () => {
    it("should find workout progress for a user", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: "progress-123",
              data: () => ({
                userId: mockWorkoutProgress.userId,
                workoutId: mockWorkoutProgress.workoutId,
                workoutName: mockWorkoutProgress.workoutName,
                completedAt: mockWorkoutProgress.completedAt.toISOString(),
                duration: mockWorkoutProgress.duration,
                exercises: mockWorkoutProgress.exercises,
                overallNotes: mockWorkoutProgress.overallNotes,
                rating: mockWorkoutProgress.rating,
                createdAt: mockWorkoutProgress.createdAt.toISOString(),
                updatedAt: mockWorkoutProgress.updatedAt.toISOString(),
              }),
            },
          ],
        }),
      });

      const result = await progressRepository.findWorkoutProgressByUser("user-456");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(result).toHaveLength(1);
    });
  });

  describe("upsertPersonalRecord", () => {
    it("should create new personal record if none exists", async () => {
      mockGet.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await progressRepository.upsertPersonalRecord(
        "user-456",
        "bench-press",
        "Barbell Bench Press",
        135,
        10,
        "progress-123"
      );

      expect(result).toHaveProperty("id");
      expect(result.weight).toBe(135);
      expect(result.reps).toBe(10);
    });

    it("should update existing PR if new weight is higher", async () => {
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "pr-123",
            ref: { update: mockUpdate },
            data: () => ({
              weight: 125,
              reps: 10,
              achievedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          },
        ],
      });

      const result = await progressRepository.upsertPersonalRecord(
        "user-456",
        "bench-press",
        "Barbell Bench Press",
        135,
        10
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.weight).toBe(135);
    });
  });

  describe("findPersonalRecordsByUser", () => {
    it("should find all personal records for a user", async () => {
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: "pr-123",
              data: () => ({
                userId: mockPersonalRecord.userId,
                exerciseId: mockPersonalRecord.exerciseId,
                exerciseName: mockPersonalRecord.exerciseName,
                weight: mockPersonalRecord.weight,
                reps: mockPersonalRecord.reps,
                achievedAt: mockPersonalRecord.achievedAt.toISOString(),
                workoutProgressId: mockPersonalRecord.workoutProgressId,
                createdAt: mockPersonalRecord.createdAt.toISOString(),
                updatedAt: mockPersonalRecord.updatedAt.toISOString(),
              }),
            },
          ],
        }),
      });

      const result = await progressRepository.findPersonalRecordsByUser("user-456");

      expect(result).toHaveLength(1);
      expect(result[0].exerciseId).toBe("bench-press");
    });
  });

  describe("createBodyMetrics", () => {
    it("should create body metrics successfully", async () => {
      const result = await progressRepository.createBodyMetrics(
        "user-456",
        mockCreateBodyMetricsData
      );

      expect(mockCollection).toHaveBeenCalledWith("bodyMetrics");
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.userId).toBe("user-456");
      expect(result.weight).toBe(75.5);
    });
  });

  describe("findBodyMetricsById", () => {
    it("should find body metrics by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "metrics-123",
        data: () => ({
          userId: mockBodyMetrics.userId,
          date: mockBodyMetrics.date.toISOString(),
          weight: mockBodyMetrics.weight,
          bodyFat: mockBodyMetrics.bodyFat,
          measurements: mockBodyMetrics.measurements,
          notes: mockBodyMetrics.notes,
          createdAt: mockBodyMetrics.createdAt.toISOString(),
          updatedAt: mockBodyMetrics.updatedAt.toISOString(),
        }),
      });

      const result = await progressRepository.findBodyMetricsById("metrics-123");

      expect(result.id).toBe("metrics-123");
      expect(result.weight).toBe(75.5);
    });

    it("should throw NotFoundError if body metrics does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        progressRepository.findBodyMetricsById("nonexistent-id")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("findBodyMetricsByUser", () => {
    it("should find body metrics for a user", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: "metrics-123",
              data: () => ({
                userId: mockBodyMetrics.userId,
                date: mockBodyMetrics.date.toISOString(),
                weight: mockBodyMetrics.weight,
                bodyFat: mockBodyMetrics.bodyFat,
                measurements: mockBodyMetrics.measurements,
                notes: mockBodyMetrics.notes,
                createdAt: mockBodyMetrics.createdAt.toISOString(),
                updatedAt: mockBodyMetrics.updatedAt.toISOString(),
              }),
            },
          ],
        }),
      });

      const result = await progressRepository.findBodyMetricsByUser("user-456");

      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(75.5);
    });
  });

  describe("updateBodyMetrics", () => {
    it("should update body metrics successfully", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
      });

      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "metrics-123",
        data: () => ({
          userId: mockBodyMetrics.userId,
          date: mockBodyMetrics.date.toISOString(),
          weight: 74.8,
          bodyFat: mockBodyMetrics.bodyFat,
          measurements: mockBodyMetrics.measurements,
          notes: mockBodyMetrics.notes,
          createdAt: mockBodyMetrics.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await progressRepository.updateBodyMetrics(
        "metrics-123",
        mockUpdateBodyMetricsData
      );

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.weight).toBe(74.8);
    });

    it("should throw NotFoundError if body metrics does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        progressRepository.updateBodyMetrics("nonexistent-id", mockUpdateBodyMetricsData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteBodyMetrics", () => {
    it("should delete body metrics successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      });

      await progressRepository.deleteBodyMetrics("metrics-123");

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if body metrics does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(progressRepository.deleteBodyMetrics("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
