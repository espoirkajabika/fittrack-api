import { GoalRepository } from "../../../src/api/v1/repositories/goalRepository";
import { db } from "../../../src/config/firebaseConfig";
import {
  mockCreateWeightGoalData,
  mockWeightGoal,
  mockUpdateGoalData,
  mockGoals,
} from "../../helpers/goalMockData";
import { NotFoundError } from "../../../src/api/v1/models/errors";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("GoalRepository", () => {
  let goalRepository: GoalRepository;
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

    goalRepository = new GoalRepository();

    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDelete = jest.fn().mockResolvedValue(undefined);
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "goal-123",
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
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("create", () => {
    it("should create a new goal successfully", async () => {
      const result = await goalRepository.create("user-456", mockCreateWeightGoalData);

      expect(mockCollection).toHaveBeenCalledWith("goals");
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.userId).toBe("user-456");
      expect(result.type).toBe("weight");
      expect(result.status).toBe("active");
      expect(result.currentProgress).toBe(0);
    });
  });

  describe("findById", () => {
    it("should find a goal by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "goal-123",
        data: () => ({
          userId: mockWeightGoal.userId,
          type: mockWeightGoal.type,
          title: mockWeightGoal.title,
          description: mockWeightGoal.description,
          targetWeight: mockWeightGoal.targetWeight,
          startValue: mockWeightGoal.startValue,
          currentValue: mockWeightGoal.currentValue,
          currentProgress: mockWeightGoal.currentProgress,
          startDate: mockWeightGoal.startDate.toISOString(),
          deadline: mockWeightGoal.deadline.toISOString(),
          status: mockWeightGoal.status,
          createdAt: mockWeightGoal.createdAt.toISOString(),
          updatedAt: mockWeightGoal.updatedAt.toISOString(),
        }),
      });

      const result = await goalRepository.findById("goal-123");

      expect(result.id).toBe("goal-123");
      expect(result.type).toBe("weight");
    });

    it("should throw NotFoundError if goal does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(goalRepository.findById("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("findByUser", () => {
    it("should find all goals for a user", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockGoals.map((goal) => ({
            id: goal.id,
            data: () => ({
              userId: goal.userId,
              type: goal.type,
              title: goal.title,
              description: goal.description,
              targetWeight: goal.targetWeight,
              strengthTarget: goal.strengthTarget,
              frequencyTarget: goal.frequencyTarget,
              startValue: goal.startValue,
              currentValue: goal.currentValue,
              currentProgress: goal.currentProgress,
              startDate: goal.startDate.toISOString(),
              deadline: goal.deadline.toISOString(),
              status: goal.status,
              createdAt: goal.createdAt.toISOString(),
              updatedAt: goal.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const result = await goalRepository.findByUser("user-456");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(result).toHaveLength(3);
    });

    it("should filter goals by type", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await goalRepository.findByUser("user-456", { type: "weight" });

      expect(mockWhere).toHaveBeenCalledWith("type", "==", "weight");
    });

    it("should filter goals by status", async () => {
      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await goalRepository.findByUser("user-456", { status: "active" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
    });
  });

  describe("update", () => {
    it("should update a goal successfully", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ status: "active" }),
      });

      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "goal-123",
        data: () => ({
          userId: mockWeightGoal.userId,
          type: mockWeightGoal.type,
          title: mockUpdateGoalData.title,
          description: mockUpdateGoalData.description,
          targetWeight: mockUpdateGoalData.targetWeight,
          startValue: mockWeightGoal.startValue,
          currentValue: mockWeightGoal.currentValue,
          currentProgress: mockWeightGoal.currentProgress,
          startDate: mockWeightGoal.startDate.toISOString(),
          deadline: mockWeightGoal.deadline.toISOString(),
          status: mockWeightGoal.status,
          createdAt: mockWeightGoal.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await goalRepository.update("goal-123", mockUpdateGoalData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.title).toBe(mockUpdateGoalData.title);
    });

    it("should throw NotFoundError if goal does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        goalRepository.update("nonexistent-id", mockUpdateGoalData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateProgress", () => {
    it("should update goal progress successfully", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
      });

      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "goal-123",
        data: () => ({
          ...mockWeightGoal,
          currentValue: 75,
          currentProgress: 50,
          startDate: mockWeightGoal.startDate.toISOString(),
          deadline: mockWeightGoal.deadline.toISOString(),
          createdAt: mockWeightGoal.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await goalRepository.updateProgress("goal-123", {
        currentValue: 75,
        currentProgress: 50,
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.currentValue).toBe(75);
      expect(result.currentProgress).toBe(50);
    });
  });

  describe("delete", () => {
    it("should delete a goal successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      });

      await goalRepository.delete("goal-123");

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if goal does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(goalRepository.delete("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getStatistics", () => {
    it("should calculate goal statistics", async () => {
      const completedGoal = {
        ...mockWeightGoal,
        status: "completed" as const,
        completedAt: new Date("2025-12-01T00:00:00Z"),
      };

      mockWhere.mockReturnValue({
        where: mockWhere,
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [mockWeightGoal, completedGoal].map((goal) => ({
            id: goal.id,
            data: () => ({
              userId: goal.userId,
              type: goal.type,
              title: goal.title,
              status: goal.status,
              startDate: goal.startDate.toISOString(),
              deadline: goal.deadline.toISOString(),
              completedAt: goal.completedAt?.toISOString(),
              createdAt: goal.createdAt.toISOString(),
              updatedAt: goal.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const stats = await goalRepository.getStatistics("user-456");

      expect(stats.totalGoals).toBe(2);
      expect(stats.completedGoals).toBe(1);
      expect(stats.activeGoals).toBe(1);
      expect(stats.completionRate).toBe(50);
    });
  });
});
