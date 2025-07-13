import type { Database } from "../db/index";
import type {
  JobApplicationStatusInsert,
  JobApplicationStatusSelect,
  JobApplicationStatusUpdate,
} from "../db/types/jobApplication.type";
import { jobApplicationStatuses } from "../db/schema/jobApplication.db";
import { asc, eq } from "drizzle-orm";

export interface IJobApplicationStatus {
  getStatuses(applicationId: number): Promise<JobApplicationStatusSelect[]>;
  addStatus(
    applicationId: number,
    status: JobApplicationStatusInsert,
  ): Promise<{ id: number }>;
  updateStatus(
    applicationId: number,
    newStatus: JobApplicationStatusUpdate,
  ): Promise<boolean>;
  deleteStatuses(applicationId: number): Promise<boolean>;
}

export class JobApplicationStatusRepository implements IJobApplicationStatus {
  private readonly table = jobApplicationStatuses;
  constructor(private readonly db: Database) {}

  async getStatuses(applicationId: number) {
    return this.db.query.jobApplicationStatuses.findMany({
      where: eq(jobApplicationStatuses.applicationId, applicationId),
      orderBy: [asc(jobApplicationStatuses.changedAt)],
    });
  }

  async addStatus(applicationId: number, status: JobApplicationStatusInsert) {
    const [inserted] = await this.db
      .insert(this.table)
      .values({ ...status, applicationId })
      .$returningId();

    return { id: inserted.id };
  }
  async updateStatus(id: number, newStatus: JobApplicationStatusUpdate) {
    const [updated] = await this.db
      .update(this.table)
      .set(newStatus)
      .where(eq(this.table.id, id));

    return updated.affectedRows > 0;
  }
  async deleteStatuses(applicationId: number) {
    const [deleted] = await this.db
      .delete(this.table)
      .where(eq(this.table.applicationId, applicationId));

    return deleted.affectedRows > 0;
  }
}
