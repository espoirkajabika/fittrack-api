import { WorkoutPlanRepository } from "../../../src/api/v1/repositories/workoutPlanRepository";
import { db } from "../../../src/config/firebaseConfig";
import {
  mockCreateWorkoutPlanData,
  mockWorkoutPlan,
  mockUpdateWorkoutPlanData,
  mockWorkoutPlans,
  mockEnrollment,
} from "../../helpers/workoutPlanMockData";
import { NotFoundError } from "../../../src/api/v1/models/errors";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("WorkoutPlanRepository", () => {
  let workoutPlanRepository: WorkoutPlanRepository;
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

    workoutPlanRepository = new WorkoutPlanRepository();

    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockDelete = jest.fn().mockResolvedValue(undefined);
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "plan-123",
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
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("create", () => {
    it("should create a new workout plan successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "plan-123",
        data: () => ({
          ...mockCreateWorkoutPlanData,
          createdBy: "trainer-456",
          enrolledCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await workoutPlanRepository.create(
        "trainer-456",
        mockCreateWorkoutPlanData
      );

      expect(mockCollection).toHaveBeenCalledWith("workoutPlans");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.createdBy).toBe("trainer-456");
      expect(result.name).toBe(mockCreateWorkoutPlanData.name);
      expect(result.enrolledCount).toBe(0);
    });
  });

  describe("findById", () => {
    it("should find a workout plan by ID", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "plan-123",
        data: () => ({
          name: mockWorkoutPlan.name,
          description: mockWorkoutPlan.description,
          duration: mockWorkoutPlan.duration,
          difficulty: mockWorkoutPlan.difficulty,
          workouts: mockWorkoutPlan.workouts,
          createdBy: mockWorkoutPlan.createdBy,
          isPublic: mockWorkoutPlan.isPublic,
          enrolledCount: mockWorkoutPlan.enrolledCount,
          createdAt: mockWorkoutPlan.createdAt.toISOString(),
          updatedAt: mockWorkoutPlan.updatedAt.toISOString(),
        }),
      });

      const result = await workoutPlanRepository.findById("plan-123");

      expect(mockCollection).toHaveBeenCalledWith("workoutPlans");
      expect(mockDoc).toHaveBeenCalledWith("plan-123");
      expect(mockGet).toHaveBeenCalled();
      expect(result.id).toBe("plan-123");
      expect(result.name).toBe(mockWorkoutPlan.name);
    });

    it("should throw NotFoundError if workout plan does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(workoutPlanRepository.findById("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("findAll", () => {
    it("should find all workout plans", async () => {
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: mockWorkoutPlans.map((plan) => ({
            id: plan.id,
            data: () => ({
              name: plan.name,
              description: plan.description,
              duration: plan.duration,
              difficulty: plan.difficulty,
              workouts: plan.workouts,
              createdBy: plan.createdBy,
              isPublic: plan.isPublic,
              enrolledCount: plan.enrolledCount,
              createdAt: plan.createdAt.toISOString(),
              updatedAt: plan.updatedAt.toISOString(),
            }),
          })),
        }),
      });

      const result = await workoutPlanRepository.findAll();

      expect(mockCollection).toHaveBeenCalledWith("workoutPlans");
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(result).toHaveLength(2);
    });

    it("should find workout plans with difficulty filter", async () => {
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await workoutPlanRepository.findAll({ difficulty: "beginner" });

      expect(mockWhere).toHaveBeenCalledWith("difficulty", "==", "beginner");
    });

    it("should find workout plans with isPublic filter", async () => {
      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      await workoutPlanRepository.findAll({ isPublic: true });

      expect(mockWhere).toHaveBeenCalledWith("isPublic", "==", true);
    });
  });

  describe("update", () => {
    it("should update a workout plan successfully", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
      });

      mockGet.mockResolvedValueOnce({
        exists: true,
        id: "plan-123",
        data: () => ({
          name: mockUpdateWorkoutPlanData.name,
          description: mockUpdateWorkoutPlanData.description,
          duration: mockUpdateWorkoutPlanData.duration,
          difficulty: mockWorkoutPlan.difficulty,
          workouts: mockWorkoutPlan.workouts,
          createdBy: mockWorkoutPlan.createdBy,
          isPublic: mockWorkoutPlan.isPublic,
          enrolledCount: mockWorkoutPlan.enrolledCount,
          createdAt: mockWorkoutPlan.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await workoutPlanRepository.update("plan-123", mockUpdateWorkoutPlanData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.name).toBe(mockUpdateWorkoutPlanData.name);
    });

    it("should throw NotFoundError if workout plan does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        workoutPlanRepository.update("nonexistent-id", mockUpdateWorkoutPlanData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete a workout plan successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      });

      await workoutPlanRepository.delete("plan-123");

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if workout plan does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(workoutPlanRepository.delete("nonexistent-id")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getUserEnrollments", () => {
    it("should get user enrollments", async () => {
      mockOrderBy.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [
            {
              id: mockEnrollment.id,
              data: () => ({
                userId: mockEnrollment.userId,
                planId: mockEnrollment.planId,
                startDate: mockEnrollment.startDate.toISOString(),
                status: mockEnrollment.status,
                currentWeek: mockEnrollment.currentWeek,
                createdAt: mockEnrollment.createdAt.toISOString(),
                updatedAt: mockEnrollment.updatedAt.toISOString(),
              }),
            },
          ],
        }),
      });

      mockWhere.mockReturnValue({
        orderBy: mockOrderBy,
      });

      const result = await workoutPlanRepository.getUserEnrollments("user-456");

      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user-456");
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("user-456");
    });
  });
});

