import { WorkoutPlanRepository } from "../repositories/workoutPlanRepository";
import { WorkoutRepository } from "../repositories/workoutRepository";
import {
  WorkoutPlan,
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  WorkoutPlanEnrollment,
} from "../models/workoutPlan";
import { CreateWorkoutDto } from "../models/workout";

/**
 * Filter options for workout plans
 */
interface WorkoutPlanFilters {
  difficulty?: string;
  isPublic?: boolean;
  createdBy?: string;
}

/**
 * Workout Plan Service
 * Contains business logic for workout plan operations
 */
export class WorkoutPlanService {
  private workoutPlanRepository: WorkoutPlanRepository;
  private workoutRepository: WorkoutRepository;

  constructor() {
    this.workoutPlanRepository = new WorkoutPlanRepository();
    this.workoutRepository = new WorkoutRepository();
  }

  /**
   * Create a new workout plan
   * Only trainers, coaches, and admins can create plans
   */
  async createWorkoutPlan(
    userId: string,
    planData: CreateWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    return await this.workoutPlanRepository.create(userId, planData);
  }

  /**
   * Get workout plan by ID
   * All authenticated users can view public plans
   * Only creator/trainers/coaches/admins can view private plans
   */
  async getWorkoutPlanById(planId: string): Promise<WorkoutPlan> {
    return await this.workoutPlanRepository.findById(planId);
  }

  /**
   * Get all workout plans with optional filters
   * Regular users only see public plans
   * Trainers/coaches/admins see all plans
   */
  async getAllWorkoutPlans(
    userRole: string,
    filters?: WorkoutPlanFilters
  ): Promise<WorkoutPlan[]> {
    // Regular users only see public plans
    if (!["trainer", "coach", "admin"].includes(userRole)) {
      return await this.workoutPlanRepository.findAll({ ...filters, isPublic: true });
    }

    // Trainers/coaches/admins see all plans
    return await this.workoutPlanRepository.findAll(filters);
  }

  /**
   * Update a workout plan
   * Only trainers, coaches, and admins can update plans
   */
  async updateWorkoutPlan(
    planId: string,
    updateData: UpdateWorkoutPlanDto
  ): Promise<WorkoutPlan> {
    return await this.workoutPlanRepository.update(planId, updateData);
  }

  /**
   * Delete a workout plan
   * Only admins can delete plans
   */
  async deleteWorkoutPlan(planId: string): Promise<void> {
    await this.workoutPlanRepository.delete(planId);
  }

  /**
   * Enroll a user in a workout plan
   * Generates scheduled workouts for the user based on the plan
   */
  async enrollUserInPlan(
    userId: string,
    planId: string
  ): Promise<{
    enrollment: WorkoutPlanEnrollment;
    workoutsCreated: number;
  }> {
    // Get the plan
    const plan = await this.workoutPlanRepository.findById(planId);

    // Enroll the user
    const enrollment = await this.workoutPlanRepository.enrollUser(userId, planId);

    // Generate workouts for the first week
    const startDate = new Date(enrollment.startDate);
    let workoutsCreated = 0;

    // Get workouts for week 1
    const weekWorkouts = plan.workouts.filter((w) => w.weekNumber === 1);

    for (const planWorkout of weekWorkouts) {
      // Calculate the scheduled date based on day of week
      const scheduledDate = new Date(startDate);
      const daysToAdd = planWorkout.dayOfWeek - startDate.getDay();
      scheduledDate.setDate(scheduledDate.getDate() + (daysToAdd >= 0 ? daysToAdd : daysToAdd + 7));

      // Create the workout
      const workoutData: CreateWorkoutDto = {
        name: planWorkout.name,
        scheduledDate,
        exercises: planWorkout.exercises,
        notes: planWorkout.notes,
      };

      await this.workoutRepository.create(userId, workoutData);
      workoutsCreated++;
    }

    return {
      enrollment,
      workoutsCreated,
    };
  }

  /**
   * Get user's enrollments
   */
  async getUserEnrollments(userId: string): Promise<WorkoutPlanEnrollment[]> {
    return await this.workoutPlanRepository.getUserEnrollments(userId);
  }
}
