import type { IJobApplication } from "../repositories/jobApplication.repo";
import type {
  JobApplicationCreate,
  JobApplicationQueryOptions,
  JobApplicationSelect,
  JobApplicationStatusSelect,
  JobApplicationUpdate,
  PaginatedJobApplicationResponse,
} from "../db/types/jobApplication.type";
import { NotFoundError } from "../errors/not-found.error";
import type { IJobApplicationStatus } from "../repositories/jobApplicationStatus.repo";

export interface IJobApplicationService {
  createJobApplication(
    data: JobApplicationCreate,
    userId: number,
  ): Promise<JobApplicationSelect>;
  getJobApplicationById(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect>;
  getAllJobApplications(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse>;
  updateJobApplication(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
    statusChangeAt?: Date,
  ): Promise<JobApplicationSelect>;
  getStatusTimeline(
    applicationId: number,
    userId: number,
  ): Promise<JobApplicationStatusSelect[]>;
  deleteJobApplication(id: number, userId: number): Promise<boolean>;
}

/**
 * JobApplicationService manages job application business logic including
 * CRUD operations and status timeline tracking.
 */
export class JobApplicationService implements IJobApplicationService {
  constructor(
    private readonly repo: IJobApplication,
    private readonly statusRepo: IJobApplicationStatus,
  ) {}

  /**
   * Validates that a job application exists and belongs to the specified user.
   * @param id - Job application ID
   * @param userId - User ID
   * @returns The job application if found and owned by user
   * @throws NotFoundError if application doesn't exist or doesn't belong to user
   */
  private async validateApplicationOwnership(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    const application = await this.repo.getByIdAndUser(id, userId);
    if (!application) {
      throw new NotFoundError(
        `Job Application with ID ${id} not found or not accessible for user ${userId}`,
      );
    }
    return application;
  }

  /**
   * Creates an initial status entry for a new job application.
   * @param applicationId - The job application ID
   * @param initialStatus - The initial status (defaults to "applied")
   * @param appliedAt - When the application was submitted (defaults to current time)
   */
  private async createInitialStatus(
    applicationId: number,
    initialStatus: string = "applied",
    appliedAt: Date = new Date(),
  ): Promise<void> {
    await this.statusRepo.addStatus(applicationId, {
      applicationId,
      status: initialStatus as any,
      changedAt: appliedAt,
    });
  }

  /**
   * Handles status changes when updating a job application.
   * @param applicationId - The job application ID
   * @param currentStatus - Current application status
   * @param newStatus - New status to update to
   * @param statusChangeAt - When the status change occurred
   */
  private async handleStatusChange(
    applicationId: number,
    currentStatus: string,
    newStatus: string,
    statusChangeAt: Date = new Date(),
  ): Promise<void> {
    if (newStatus !== currentStatus) {
      await this.statusRepo.addStatus(applicationId, {
        applicationId,
        status: newStatus as any,
        changedAt: statusChangeAt,
      });
    }
  }

  /**
   * Creates a new job application with initial status tracking.
   * @param data - Job application data (without userId)
   * @param userId - ID of the user creating the application
   * @returns The created job application with full details
   */
  async createJobApplication(
    data: JobApplicationCreate,
    userId: number,
  ): Promise<JobApplicationSelect> {
    // Create the job application
    const createdApplication = await this.repo.create({
      ...data,
      userId,
    });

    // Create initial status entry
    const initialStatus = data.status ?? "applied";
    const appliedAt = data.appliedAt ?? new Date();

    await this.createInitialStatus(
      createdApplication.id,
      initialStatus,
      appliedAt,
    );

    // Return the complete application data
    return this.getJobApplicationById(createdApplication.id, userId);
  }

  /**
   * Retrieves a job application by ID, ensuring user ownership.
   * @param id - Job application ID
   * @param userId - User ID
   * @returns The job application if found and accessible
   */
  async getJobApplicationById(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    return this.validateApplicationOwnership(id, userId);
  }

  /**
   * Retrieves all job applications for a user with optional filtering and pagination.
   * @param userId - User ID
   * @param options - Query options for filtering, sorting, and pagination
   * @returns Paginated list of job applications
   */
  async getAllJobApplications(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse> {
    return this.repo.getAllByUser(userId, options);
  }

  /**
   * Updates a job application and handles status changes if applicable.
   * @param id - Job application ID
   * @param userId - User ID
   * @param newData - Updated application data
   * @param statusChangeAt - When status change occurred (if applicable)
   * @returns The updated job application
   */
  async updateJobApplication(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
    statusChangeAt?: Date,
  ): Promise<JobApplicationSelect> {
    // Validate ownership and get current data
    const currentApplication = await this.validateApplicationOwnership(
      id,
      userId,
    );

    // Handle status change if present
    if (newData.status && newData.status !== currentApplication.status) {
      await this.handleStatusChange(
        id,
        currentApplication.status,
        newData.status,
        statusChangeAt ?? new Date(),
      );
    }

    // Update the application
    const updatedApplication = await this.repo.updateByIdAndUser(
      id,
      userId,
      newData,
    );
    if (!updatedApplication) {
      throw new NotFoundError(
        `Failed to update Job Application with ID ${id} for user ${userId}`,
      );
    }

    // Return fresh data
    return this.getJobApplicationById(id, userId);
  }

  /**
   * Retrieves the complete status timeline for a job application.
   * @param applicationId - Job application ID
   * @param userId - User ID
   * @returns Array of status changes ordered by date
   */
  async getStatusTimeline(
    applicationId: number,
    userId: number,
  ): Promise<JobApplicationStatusSelect[]> {
    // Validate ownership first
    await this.validateApplicationOwnership(applicationId, userId);

    // Return status timeline
    return this.statusRepo.getStatuses(applicationId);
  }

  /**
   * Deletes a job application and all associated status records.
   * @param id - Job application ID
   * @param userId - User ID
   * @returns True if deletion was successful
   */
  async deleteJobApplication(id: number, userId: number): Promise<boolean> {
    // Validate ownership first
    await this.validateApplicationOwnership(id, userId);

    // Delete associated status records
    await this.statusRepo.deleteStatuses(id);

    // Delete the application
    return this.repo.deleteByIdAndUser(id, userId);
  }
}
