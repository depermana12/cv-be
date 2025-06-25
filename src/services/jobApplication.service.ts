import type {
  IJobApplication,
  JobApplicationRepository,
} from "../repositories/jobApplication.repo";
import type {
  JobApplicationInsert,
  JobApplicationQueryOptions,
  JobApplicationSelect,
  JobApplicationUpdate,
  PaginatedJobApplicationResponse,
} from "../db/types/jobApplication.type";
import { NotFoundError } from "../errors/not-found.error";

export class JobApplicationService {
  constructor(private readonly jobApplicationRepository: IJobApplication) {}

  private async assertJobApplicationOwnedByUser(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    const app =
      await this.jobApplicationRepository.getJobApplicationByIdAndUserId(
        id,
        userId,
      );
    if (!app) {
      throw new NotFoundError(
        `[Service] Job Application with ID ${id} not found for user ${userId}`,
      );
    }
    return app;
  }

  async createJobApplication(
    data: Omit<JobApplicationInsert, "userId">,
    userId: number,
  ): Promise<JobApplicationSelect> {
    const { id } = await this.jobApplicationRepository.createJobApplication({
      ...data,
      userId,
    });
    return this.getJobApplicationById(id, userId);
  }

  async getJobApplicationById(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    return this.assertJobApplicationOwnedByUser(id, userId);
  }

  async getAllJobApplications(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse> {
    return this.jobApplicationRepository.getAllJobApplicationsByUserId(
      userId,
      options,
    );
  }

  async updateJobApplication(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
  ): Promise<JobApplicationSelect> {
    const app = await this.assertJobApplicationOwnedByUser(id, userId);
    const updated =
      await this.jobApplicationRepository.updateJobApplicationByIdAndUserId(
        app.id,
        userId,
        newData,
      );
    if (!updated) {
      throw new NotFoundError(
        `[Service] Job Application with ID ${id} not found for user ${userId}`,
      );
    }
    return this.getJobApplicationById(id, userId);
  }

  async deleteJobApplication(id: number, userId: number): Promise<boolean> {
    return this.jobApplicationRepository.deleteJobApplicationByIdAndUserId(
      id,
      userId,
    );
  }
}
