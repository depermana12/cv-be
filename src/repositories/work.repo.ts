import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { works, workDescriptions } from "../db/schema/work.db";
import type { WorkInsert, WorkDescInsert } from "../db/schema/work.db";

export class WorkRepository extends BaseRepository<typeof works, WorkInsert> {
  constructor() {
    super(db, works);
  }
  async getDescription(descId: number) {
    const rows = await this.db
      .select()
      .from(workDescriptions)
      .where(eq(workDescriptions.workId, descId));
    return rows[0] ?? null;
  }
  async addDescription(workId: number, description: WorkDescInsert) {
    const insertedDetail = await this.db
      .insert(workDescriptions)
      .values({ ...description, workId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<WorkDescInsert>,
  ) {
    await this.db
      .update(workDescriptions)
      .set(newDescription)
      .where(eq(workDescriptions.id, descId));
    return this.getDescription(descId);
  }
  async deleteProjectCascade(id: number) {
    await this.db
      .delete(workDescriptions)
      .where(eq(workDescriptions.workId, id));
    await this.db.delete(works).where(eq(works.id, id));
  }
}
