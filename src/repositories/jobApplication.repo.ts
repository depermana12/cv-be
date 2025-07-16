import { and, eq, sql, like, desc, asc, gte, lte } from "drizzle-orm";
import { jobApplications } from "../db/schema/jobApplication.db";
import type {
  JobApplicationInsert,
  JobApplicationSelect,
  JobApplicationUpdate,
  JobApplicationQueryOptions,
  PaginatedJobApplicationResponse,
} from "../db/types/jobApplication.type";
import { BaseRepository } from "./base.repo";
import type { Database } from "../db/index";

export interface IJobApplication {
  createJobApplication(data: JobApplicationInsert): Promise<{ id: number }>;
  getJobApplicationByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect | null>;
  getAllJobApplicationsByUserId(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse>;
  updateJobApplicationByIdAndUserId(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
  ): Promise<boolean>;
  deleteJobApplicationByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<boolean>;
}

export class JobApplicationRepository
  extends BaseRepository<
    typeof jobApplications,
    JobApplicationInsert,
    JobApplicationSelect,
    JobApplicationUpdate
  >
  implements IJobApplication
{
  constructor(db: Database) {
    super(jobApplications, db);
  }

  async createJobApplication(
    data: JobApplicationInsert,
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(jobApplications)
      .values(data)
      .$returningId();
    return { id: result.id };
  }

  async getJobApplicationByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<JobApplicationSelect | null> {
    const result = await this.db.query.jobApplications.findFirst({
      where: and(
        eq(jobApplications.id, id),
        eq(jobApplications.userId, userId),
      ),
    });
    return result ?? null;
  }

  async getAllJobApplicationsByUserId(
    userId: number,
    options?: JobApplicationQueryOptions,
  ): Promise<PaginatedJobApplicationResponse> {
    const whereClause = [eq(jobApplications.userId, userId)];

    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${jobApplications.position})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    if (options?.appliedAtFrom) {
      whereClause.push(gte(jobApplications.appliedAt, options.appliedAtFrom));
    }

    if (options?.appliedAtTo) {
      whereClause.push(lte(jobApplications.appliedAt, options.appliedAtTo));
    }

    const data = await this.db.query.jobApplications.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(jobApplications[options.sortBy])
              : asc(jobApplications[options.sortBy]),
          ]
        : [desc(jobApplications.createdAt)],
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    });

    const count = await this.db.$count(jobApplications, and(...whereClause));

    return {
      data,
      total: count,
      limit: options?.limit ?? 10,
      offset: options?.offset ?? 0,
    };
  }

  async updateJobApplicationByIdAndUserId(
    id: number,
    userId: number,
    newData: JobApplicationUpdate,
  ): Promise<boolean> {
    const result = await this.db
      .update(jobApplications)
      .set(newData)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
      );
    return result.length > 0;
  }

  async deleteJobApplicationByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<boolean> {
    const result = await this.db
      .delete(jobApplications)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
      );
    return result.length > 0;
  }
}
