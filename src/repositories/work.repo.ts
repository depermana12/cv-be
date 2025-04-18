import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { work, workDetails } from "../db/schema/work.db";
import type { WorkInsert, WorkDetailInsert } from "../db/schema/work.db";

export class WorkRepository extends BaseRepository<typeof work, WorkInsert> {
  constructor() {
    super(work, "id");
  }
  async getDetailById(workExperienceId: number) {
    const rows = await db
      .select()
      .from(workDetails)
      .where(eq(workDetails.id, workExperienceId));
    return rows[0];
  }
  async addDetails(workId: number, newProjectDetail: WorkDetailInsert) {
    const insertedDetail = await db
      .insert(workDetails)
      .values({ ...newProjectDetail, workId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(detailId: number, newDetail: Partial<WorkDetailInsert>) {
    await db
      .update(workDetails)
      .set(newDetail)
      .where(eq(workDetails.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await db.delete(workDetails).where(eq(workDetails.workId, id));
    await db.delete(work).where(eq(work.id, id));
  }
}
