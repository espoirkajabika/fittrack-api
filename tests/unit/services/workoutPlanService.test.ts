import { WorkoutPlanService } from "../../../src/api/v1/services/workoutPlanService";
import { WorkoutPlanRepository } from "../../../src/api/v1/repositories/workoutPlanRepository";
import { WorkoutRepository } from "../../../src/api/v1/repositories/workoutRepository";
import {
  mockCreateWorkoutPlanData,
  mockWorkoutPlan,
  mockUpdateWorkoutPlanData,
  mockWorkoutPlans,
  mockEnrollment,
} from "../../helpers/workoutPlanMockData";

// Mock Firebase config
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

// Mock the repositories
jest.mock("../../../src/api/v1/repositories/workoutPlanRepository");
jest.mock("../../../src/api/v1/repositories/workoutRepository");

describe("WorkoutPlanService", () => {
  let workoutPlanService: WorkoutPlanService;
  let mockWorkoutPlanRepository: jest.Mocked<WorkoutPlanRepository>;
  let mockWorkoutRepository: jest.Mocked<WorkoutRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    workoutPlanService = new WorkoutPlanService();
    mockWorkoutPlanRepository = (
      WorkoutPlanRepository as jest.MockedClass<typeof WorkoutPlanRepository>
    ).mock.instances[0] as jest.Mocked<WorkoutPlanRepository>;
    mockWorkoutRepository = (
      WorkoutRepository as jest.MockedClass<typeof WorkoutRepository>
    ).mock.instances[0] as jest.Mocked<WorkoutRepository>;
  });

  describe("createWorkoutPlan", () => {
    it("should create a workout plan successfully", async () => {
      mockWorkoutPlanRepository.create = jest.fn().mockResolvedValue(mockWorkoutPlan);

      const result = await workoutPlanService.createWorkoutPlan(
        "trainer-456",
        mockCreateWorkoutPlanData
      );

      expect(mockWorkoutPlanRepository.create).toHaveBeenCalledWith(
        "trainer-456",
        mockCreateWorkoutPlanData
      );
      expect(result).toEqual(mockWorkoutPlan);
    });
  });

  describe("getWorkoutPlanById", () => {
    it("should get a workout plan by ID", async () => {
      mockWorkoutPlanRepository.findById = jest.fn().mockResolvedValue(mockWorkoutPlan);

      const result = await workoutPlanService.getWorkoutPlanById("plan-123");

      expect(mockWorkoutPlanRepository.findById).toHaveBeenCalledWith("plan-123");
      expect(result).toEqual(mockWorkoutPlan);
    });
  });

  describe("getAllWorkoutPlans", () => {
    it("should get all public plans for regular users", async () => {
      const publicPlans = mockWorkoutPlans.filter((p) => p.isPublic);
      mockWorkoutPlanRepository.findAll = jest.fn().mockResolvedValue(publicPlans);

      const result = await workoutPlanService.getAllWorkoutPlans("user");

      expect(mockWorkoutPlanRepository.findAll).toHaveBeenCalledWith({ isPublic: true });
      expect(result).toEqual(publicPlans);
    });

    it("should get all plans for trainers", async () => {
      mockWorkoutPlanRepository.findAll = jest.fn().mockResolvedValue(mockWorkoutPlans);

      const result = await workoutPlanService.getAllWorkoutPlans("trainer");

      expect(mockWorkoutPlanRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockWorkoutPlans);
    });

    it("should get filtered plans for admins", async () => {
      const filters = { difficulty: "beginner" };
      mockWorkoutPlanRepository.findAll = jest.fn().mockResolvedValue(mockWorkoutPlans);

      const result = await workoutPlanService.getAllWorkoutPlans("admin", filters);

      expect(mockWorkoutPlanRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockWorkoutPlans);
    });
  });

  describe("updateWorkoutPlan", () => {
    it("should update a workout plan successfully", async () => {
      const updatedPlan = { ...mockWorkoutPlan, name: "Updated Program" };
      mockWorkoutPlanRepository.update = jest.fn().mockResolvedValue(updatedPlan);

      const result = await workoutPlanService.updateWorkoutPlan(
        "plan-123",
        mockUpdateWorkoutPlanData
      );

      expect(mockWorkoutPlanRepository.update).toHaveBeenCalledWith(
        "plan-123",
        mockUpdateWorkoutPlanData
      );
      expect(result).toEqual(updatedPlan);
    });
  });

  describe("deleteWorkoutPlan", () => {
    it("should delete a workout plan successfully", async () => {
      mockWorkoutPlanRepository.delete = jest.fn().mockResolvedValue(undefined);

      await workoutPlanService.deleteWorkoutPlan("plan-123");

      expect(mockWorkoutPlanRepository.delete).toHaveBeenCalledWith("plan-123");
    });
  });

  describe("enrollUserInPlan", () => {
    it("should enroll user and create workouts", async () => {
      mockWorkoutPlanRepository.findById = jest.fn().mockResolvedValue(mockWorkoutPlan);
      mockWorkoutPlanRepository.enrollUser = jest.fn().mockResolvedValue(mockEnrollment);
      mockWorkoutRepository.create = jest.fn().mockResolvedValue({} as any);

      const result = await workoutPlanService.enrollUserInPlan("user-456", "plan-123");

      expect(mockWorkoutPlanRepository.findById).toHaveBeenCalledWith("plan-123");
      expect(mockWorkoutPlanRepository.enrollUser).toHaveBeenCalledWith("user-456", "plan-123");
      expect(result.enrollment).toEqual(mockEnrollment);
      expect(result.workoutsCreated).toBeGreaterThan(0);
    });
  });

  describe("getUserEnrollments", () => {
    it("should get user enrollments", async () => {
      const enrollments = [mockEnrollment];
      mockWorkoutPlanRepository.getUserEnrollments = jest.fn().mockResolvedValue(enrollments);

      const result = await workoutPlanService.getUserEnrollments("user-456");

      expect(mockWorkoutPlanRepository.getUserEnrollments).toHaveBeenCalledWith("user-456");
      expect(result).toEqual(enrollments);
    });
  });
});
