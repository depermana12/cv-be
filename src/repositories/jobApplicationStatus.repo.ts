import type { Database } from "../db/index";
import type {
  JobApplicationStatusInsert,
  JobApplicationStatusSelect,
  JobApplicationStatusUpdate,
} from "../db/types/jobApplication.type";
import { jobApplicationStatuses } from "../db/schema/jobApplication.db";
import { desc, eq } from "drizzle-orm";

export interface IJobApplicationStatus {
  getStatuses(applicationId: number): Promise<JobApplicationStatusSelect[]>;
  addStatus(
    applicationId: number,
    status: JobApplicationStatusInsert,
  ): Promise<JobApplicationStatusSelect>;
  updateStatus(
    id: number,
    newStatus: JobApplicationStatusUpdate,
  ): Promise<JobApplicationStatusSelect | null>;
  deleteStatuses(applicationId: number): Promise<boolean>;
}

export class JobApplicationStatusRepository implements IJobApplicationStatus {
  private readonly table = jobApplicationStatuses;
  constructor(private readonly db: Database) {}

  async getStatuses(
    applicationId: number,
  ): Promise<JobApplicationStatusSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.applicationId, applicationId))
      .orderBy(desc(this.table.changedAt));
  }

  async addStatus(
    applicationId: number,
    status: JobApplicationStatusInsert,
  ): Promise<JobApplicationStatusSelect> {
    const [inserted] = await this.db
      .insert(this.table)
      .values({ ...status, applicationId })
      .returning();

    return inserted;
  }
  async updateStatus(
    id: number,
    newStatus: JobApplicationStatusUpdate,
  ): Promise<JobApplicationStatusSelect | null> {
    const result = await this.db
      .update(this.table)
      .set(newStatus)
      .where(eq(this.table.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
  async deleteStatuses(applicationId: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.applicationId, applicationId))
      .returning();

    return result.length > 0;
  }
}
