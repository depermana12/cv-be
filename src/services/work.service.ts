import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { workExperience, workExperienceDetails } from "../db/schema/work";
import type { WorkInsert, WorkDetailInsert } from "../db/index.types";

export class Work {
  async getAll() {
    try {
      return await db.select().from(workExperience);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(workId: number) {
    try {
      const rows = await db
        .select()
        .from(workExperience)
        .where(eq(workExperience.id, workId));
      return rows[0];
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(experience: WorkInsert) {
    try {
      const insertedWorkExp = await db
        .insert(workExperience)
        .values(experience)
        .$returningId();
      return this.getById(insertedWorkExp[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(workId: number, newExperience: Partial<WorkInsert>) {
    try {
      await db
        .update(workExperience)
        .set(newExperience)
        .where(eq(workExperience.id, workId));
      return this.getById(workId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getDetailById(detailId: number) {
    const rows = await db
      .select()
      .from(workExperienceDetails)
      .where(eq(workExperienceDetails.id, detailId));
    return rows[0];
  }

  async addDetail(workExpId: number, newWorkExp: WorkDetailInsert) {
    try {
      const insertedDetail = await db
        .insert(workExperienceDetails)
        .values({ ...newWorkExp, workExperienceId: workExpId })
        .$returningId();
      return this.getDetailById(insertedDetail[0].id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async updateDetails(
    detailId: number,
    newDetailExp: Partial<WorkDetailInsert>,
  ) {
    try {
      await db
        .update(workExperienceDetails)
        .set(newDetailExp)
        .where(eq(workExperienceDetails.id, detailId));
      return this.getDetailById(detailId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db
        .delete(workExperienceDetails)
        .where(eq(workExperienceDetails.id, id));
      await db.delete(workExperience).where(eq(workExperience.id, id));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
