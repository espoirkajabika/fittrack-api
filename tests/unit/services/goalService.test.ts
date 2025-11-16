import { GoalService } from "../../../src/api/v1/services/goalService";
import { GoalRepository } from "../../../src/api/v1/repositories/goalRepository";
import { ProgressRepository } from "../../../src/api/v1/repositories/progressRepository";
import {
  mockCreateWeightGoalData,
  mockWeightGoal,
  mockCreateStrengthGoalData,
  mockStrengthGoal,
  mockUpdateGoalData,
  mockGoalStatistics,
} from "../../helpers/goalMockData";
import { mockBodyMetrics } from "../../helpers/progressMockData";
import { AuthorizationError } from "../../../src/api/v1/models/errors";

// Mock Firebase config
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock repositories
jest.mock("../../../src/api/v1/repositories/goalRepository");
jest.mock("../../../src/api/v1/repositories/progressRepository");

describe("GoalService", () => {
  let goalService: GoalService;
  let mockGoalRepository: jest.Mocked<GoalRepository>;
  let mockProgressRepository: jest.Mocked<ProgressRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    goalService = new GoalService();
    mockGoalRepository = (
      GoalRepository as jest.MockedClass<typeof GoalRepository>
    ).mock.instances[0] as jest.Mocked<GoalRepository>;
    mockProgressRepository = (
      ProgressRepository as jest.MockedClass<typeof ProgressRepository>
    ).mock.instances[0] as jest.Mocked<ProgressRepository>;
  });

  describe("createGoal", () => {
    it("should create a weight goal successfully", async () => {
      mockProgressRepository.findBodyMetricsByUser = jest
        .fn()
        .mockResolvedValue([mockBodyMetrics]);
      mockGoalRepository.create = jest.fn().mockResolvedValue(mockWeightGoal);

      const result = await goalService.createGoal("user-456", mockCreateWeightGoalData);

      expect(mockGoalRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockWeightGoal);
    });

    it("should create a strength goal successfully", async () => {
      mockGoalRepository.create = jest.fn().mockResolvedValue(mockStrengthGoal);

      const result = await goalService.createGoal(
        "user-456",
        mockCreateStrengthGoalData
      );

      expect(mockGoalRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockStrengthGoal);
    });

    it("should auto-populate startValue from recent body metrics for weight goals", async () => {
      const metricsWithWeight = { ...mockBodyMetrics, weight: 80 };
      mockProgressRepository.findBodyMetricsByUser = jest
        .fn()
        .mockResolvedValue([metricsWithWeight]);
      mockGoalRepository.create = jest.fn().mockResolvedValue(mockWeightGoal);

      const goalDataWithoutStart = { ...mockCreateWeightGoalData };
      delete goalDataWithoutStart.startValue;

      await goalService.createGoal("user-456", goalDataWithoutStart);

      expect(mockProgressRepository.findBodyMetricsByUser).toHaveBeenCalledWith(
        "user-456"
      );
    });
  });

  describe("getGoalById", () => {
    it("should get goal for owner", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      const result = await goalService.getGoalById("goal-123", "user-456", "user");

      expect(result).toEqual(mockWeightGoal);
    });

    it("should allow trainers to view any goal", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      const result = await goalService.getGoalById("goal-123", "trainer-123", "trainer");

      expect(result).toEqual(mockWeightGoal);
    });

    it("should throw AuthorizationError for other users", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      await expect(
        goalService.getGoalById("goal-123", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getUserGoals", () => {
    it("should get goals for own user", async () => {
      const goals = [mockWeightGoal];
      mockGoalRepository.findByUser = jest.fn().mockResolvedValue(goals);

      const result = await goalService.getUserGoals("user-456", "user-456", "user");

      expect(result).toEqual(goals);
    });

    it("should throw AuthorizationError for other users", async () => {
      await expect(
        goalService.getUserGoals("user-456", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("updateGoal", () => {
    it("should update a goal successfully", async () => {
      const updatedGoal = { ...mockWeightGoal, title: "Lose 15 pounds" };
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);
      mockGoalRepository.update = jest.fn().mockResolvedValue(updatedGoal);

      const result = await goalService.updateGoal(
        "goal-123",
        "user-456",
        mockUpdateGoalData
      );

      expect(result).toEqual(updatedGoal);
    });

    it("should throw AuthorizationError if not owner", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      await expect(
        goalService.updateGoal("goal-123", "other-user", mockUpdateGoalData)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("deleteGoal", () => {
    it("should delete a goal successfully", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);
      mockGoalRepository.delete = jest.fn().mockResolvedValue(undefined);

      await goalService.deleteGoal("goal-123", "user-456");

      expect(mockGoalRepository.delete).toHaveBeenCalledWith("goal-123");
    });

    it("should throw AuthorizationError if not owner", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      await expect(goalService.deleteGoal("goal-123", "other-user")).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  describe("completeGoal", () => {
    it("should mark goal as completed", async () => {
      const completedGoal = { ...mockWeightGoal, status: "completed" as const };
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);
      mockGoalRepository.update = jest.fn().mockResolvedValue(completedGoal);

      const result = await goalService.completeGoal("goal-123", "user-456");

      expect(mockGoalRepository.update).toHaveBeenCalledWith("goal-123", {
        status: "completed",
      });
      expect(result.status).toBe("completed");
    });
  });

  describe("abandonGoal", () => {
    it("should mark goal as abandoned", async () => {
      const abandonedGoal = { ...mockWeightGoal, status: "abandoned" as const };
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);
      mockGoalRepository.update = jest.fn().mockResolvedValue(abandonedGoal);

      const result = await goalService.abandonGoal("goal-123", "user-456");

      expect(mockGoalRepository.update).toHaveBeenCalledWith("goal-123", {
        status: "abandoned",
      });
      expect(result.status).toBe("abandoned");
    });
  });

  describe("updateGoalProgress", () => {
    it("should update progress for weight goal", async () => {
      const weightGoalWithProgress = {
        ...mockWeightGoal,
        currentValue: 75,
        currentProgress: 50,
      };
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);
      mockProgressRepository.findBodyMetricsByUser = jest
        .fn()
        .mockResolvedValue([{ ...mockBodyMetrics, weight: 75 }]);
      mockGoalRepository.updateProgress = jest
        .fn()
        .mockResolvedValue(weightGoalWithProgress);

      await goalService.updateGoalProgress("goal-123", "user-456");

      expect(mockProgressRepository.findBodyMetricsByUser).toHaveBeenCalled();
      expect(mockGoalRepository.updateProgress).toHaveBeenCalled();
    });

    it("should throw AuthorizationError if not owner", async () => {
      mockGoalRepository.findById = jest.fn().mockResolvedValue(mockWeightGoal);

      await expect(
        goalService.updateGoalProgress("goal-123", "other-user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("getGoalStatistics", () => {
    it("should get goal statistics for own user", async () => {
      mockGoalRepository.getStatistics = jest
        .fn()
        .mockResolvedValue(mockGoalStatistics);

      const result = await goalService.getGoalStatistics("user-456", "user-456", "user");

      expect(result).toEqual(mockGoalStatistics);
    });

    it("should throw AuthorizationError for other users", async () => {
      await expect(
        goalService.getGoalStatistics("user-456", "other-user", "user")
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("checkExpiredGoals", () => {
    it("should mark expired goals as expired", async () => {
      const expiredGoal = {
        ...mockWeightGoal,
        deadline: new Date("2020-01-01"),
      };
      const updatedGoal = { ...expiredGoal, status: "expired" as const };

      mockGoalRepository.findByUser = jest.fn().mockResolvedValue([expiredGoal]);
      mockGoalRepository.update = jest.fn().mockResolvedValue(updatedGoal);

      const result = await goalService.checkExpiredGoals("user-456");

      expect(result).toHaveLength(1);
      expect(mockGoalRepository.update).toHaveBeenCalledWith(expiredGoal.id, {
        status: "expired",
      });
    });

    it("should not mark active goals with future deadlines as expired", async () => {
      const futureGoal = {
        ...mockWeightGoal,
        deadline: new Date("2030-01-01"),
      };

      mockGoalRepository.findByUser = jest.fn().mockResolvedValue([futureGoal]);

      const result = await goalService.checkExpiredGoals("user-456");

      expect(result).toHaveLength(0);
      expect(mockGoalRepository.update).not.toHaveBeenCalled();
    });
  });
});
