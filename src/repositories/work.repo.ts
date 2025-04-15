import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { workExperience, workExperienceDetails } from "../db/schema/work.db";
import type { WorkDetailInsert } from "../db/schema/work.db";

export class WorkRepository extends BaseRepository<typeof workExperience> {
  constructor() {
    super(workExperience, "id");
  }
  async getDetailById(workExperienceId: number) {
    const rows = await db
      .select()
      .from(workExperienceDetails)
      .where(eq(workExperienceDetails.id, workExperienceId));
    return rows[0];
  }
  async addDetails(
    workExperienceId: number,
    newProjectDetail: WorkDetailInsert,
  ) {
    const insertedDetail = await db
      .insert(workExperienceDetails)
      .values({ ...newProjectDetail, workExperienceId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(detailId: number, newDetail: Partial<WorkDetailInsert>) {
    await db
      .update(workExperienceDetails)
      .set(newDetail)
      .where(eq(workExperienceDetails.id, detailId));
    return this.getDetailById(detailId);
  }
  async deleteProjectWithDetails(id: number) {
    await db
      .delete(workExperienceDetails)
      .where(eq(workExperienceDetails.workExperienceId, id));
    await db.delete(workExperience).where(eq(workExperience.id, id));
  }
}
