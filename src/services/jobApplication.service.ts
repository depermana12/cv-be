import type { IJobApplication } from "../repositories/jobApplication.repo";
import type {
  JobApplicationInsert,
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
    data: Omit<JobApplicationInsert, "userId">,
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
  ): Promise<JobApplicationSelect>;
  getStatusTimeline(
    applicationId: number,
    userId: number,
  ): Promise<JobApplicationStatusSelect[]>;
  deleteJobApplication(id: number, userId: number): Promise<boolean>;
}

export class JobApplicationService {
  constructor(
    private readonly repo: IJobApplication,
    private readonly statusRepo: IJobApplicationStatus,
  ) {}

  private async assertOwned(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    const app = await this.repo.getJobApplicationByIdAndUserId(id, userId);
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
    const { id } = await this.repo.createJobApplication({
      ...data,
      userId,
    });

    await this.statusRepo.addStatus(id, {
      applicationId: id,
      status: data.status ?? "applied",
      changedAt: data.appliedAt,
    });

    return this.getJobApplicationById(id, userId);
  }

  async getJobApplicationById(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect> {
    return this.assertOwned(id, userId);
  }

  async getAllJobApplications(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse> {
    return this.repo.getAllJobApplicationsByUserId(userId, options);
  }

  async updateJobApplication(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
    statusChangeAt?: Date,
  ): Promise<JobApplicationSelect> {
    const job = await this.assertOwned(id, userId);

    const hasStatusChanged = newData.status && newData.status !== job.status;

    if (hasStatusChanged) {
      const changedAt = statusChangeAt ?? new Date();
      await this.statusRepo.addStatus(id, {
        applicationId: id,
        status: newData.status!,
        changedAt,
      });
    }

    const updated = await this.repo.updateJobApplicationByIdAndUserId(
      id,
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

  async getStatusTimeline(applicationId: number, userId: number) {
    await this.assertOwned(applicationId, userId);
    return this.statusRepo.getStatuses(applicationId);
  }

  async deleteJobApplication(id: number, userId: number): Promise<boolean> {
    return this.repo.deleteJobApplicationByIdAndUserId(id, userId);
  }
}
