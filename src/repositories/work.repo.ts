import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { works, workDescriptions } from "../db/schema/work.db";
import type { WorkInsert, WorkDetailInsert } from "../db/schema/work.db";

export class WorkRepository extends BaseRepository<typeof works, WorkInsert> {
  constructor() {
    super(db, works);
  }
  async getDetailById(workExperienceId: number) {
    const rows = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.id, workExperienceId));
    return rows[0];
  }
  async addDetails(workId: number, newProjectDetail: WorkDetailInsert) {
    const insertedDetail = await this.db
      .insert(workDescriptions)
      .values({ ...newProjectDetail, workId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(detailId: number, newDetail: Partial<WorkDetailInsert>) {
    await this.db
      .update(workDescriptions)
      .set(newDetail)
      .where(eq(workDescriptions.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await this.db
      .delete(workDescriptions)
      .where(eq(workDescriptions.workId, id));
    await this.db.delete(works).where(eq(works.id, id));
  }
}
