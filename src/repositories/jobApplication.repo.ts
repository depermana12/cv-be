import { and, eq } from "drizzle-orm";
import { jobApplications } from "../db/schema/jobApplication.db";
import type {
  JobApplicationInsert,
  JobApplicationSelect,
  JobApplicationUpdate,
} from "../db/types/jobApplication.type";
import { BaseRepository } from "./base.repo";
import type { Database } from "../db/index";

export class JobApplicationRepo extends BaseRepository<
  typeof jobApplications,
  JobApplicationInsert,
  JobApplicationSelect,
  JobApplicationUpdate
> {
  constructor(db: Database) {
    super(jobApplications, db);
  }

  /**
   * Get all job applications by user ID.
   * @param userId - The user ID.
   * @returns An array of job applications.
   */
  async getByUserId(userId: number): Promise<JobApplicationSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.userId, userId));
  }

  /**
   * Get all job applications by CV ID.
   * @param cvId - The CV ID.
   * @returns An array of job applications.
   */
  async getByCvId(cvId: number): Promise<JobApplicationSelect[]> {
    return this.db.select().from(this.table).where(eq(this.table.cvId, cvId));
  }

  /**
   * Check if a job application belongs to a user.
   * @param applicationId - The job application ID.
   * @param userId - The user ID.
   * @returns True if the application belongs to the user, false otherwise.
   */
  async isOwnedByUser(applicationId: number, userId: number): Promise<boolean> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(
        and(eq(this.table.id, applicationId), eq(this.table.userId, userId)),
      )
      .limit(1);

    return result.length > 0;
  }
}
