import { ExpireGoalsJob } from "../../../src/jobs/expireGoalsJob";
import { GoalRepository } from "../../../src/api/v1/repositories/goalRepository";
import { mockWeightGoal } from "../../helpers/goalMockData";

// Mock Firebase config
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock repositories
jest.mock("../../../src/api/v1/repositories/goalRepository");

describe("ExpireGoalsJob", () => {
  let expireGoalsJob: ExpireGoalsJob;
  let mockGoalRepository: jest.Mocked<GoalRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    expireGoalsJob = new ExpireGoalsJob();
    mockGoalRepository = (
      GoalRepository as jest.MockedClass<typeof GoalRepository>
    ).mock.instances[0] as jest.Mocked<GoalRepository>;
  });

  describe("execute", () => {
    it("should expire goals past their deadline", async () => {
      const expiredGoal = {
        ...mockWeightGoal,
        deadline: new Date("2020-01-01"),
      };

      mockGoalRepository.findAllActiveGoals = jest
        .fn()
        .mockResolvedValue([expiredGoal]);
      mockGoalRepository.update = jest.fn().mockResolvedValue({
        ...expiredGoal,
        status: "expired",
      });

      const result = await expireGoalsJob.execute();

      expect(result.status).toBe("success");
      expect(result.itemsProcessed).toBe(1);
      expect(mockGoalRepository.update).toHaveBeenCalledWith(expiredGoal.id, {
        status: "expired",
      });
    });

    it("should not expire goals with future deadlines", async () => {
      const futureGoal = {
        ...mockWeightGoal,
        deadline: new Date("2030-01-01"),
      };

      mockGoalRepository.findAllActiveGoals = jest
        .fn()
        .mockResolvedValue([futureGoal]);

      const result = await expireGoalsJob.execute();

      expect(result.status).toBe("success");
      expect(result.itemsProcessed).toBe(0);
      expect(mockGoalRepository.update).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockGoalRepository.findAllActiveGoals = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const result = await expireGoalsJob.execute();

      expect(result.status).toBe("failure");
      expect(result.error).toBe("Database error");
    });
  });
});
