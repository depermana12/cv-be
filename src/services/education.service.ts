import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { education } from "../db/schema/education.db";
import type { EducationInsert, EducationUpdate } from "../db/index.types";

export class Education {
  async getAll() {
    try {
      return await db.select().from(education);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(educationId: number) {
    try {
      const rows = await db
        .select()
        .from(education)
        .where(eq(education.id, educationId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(eduData: EducationInsert) {
    try {
      const insertedEducation = await db
        .insert(education)
        .values(eduData)
        .$returningId();
      return this.getById(insertedEducation[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(educationId: number, newEduData: Partial<EducationUpdate>) {
    try {
      await db
        .update(education)
        .set(newEduData)
        .where(eq(education.id, educationId));
      return this.getById(educationId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(educationId: number) {
    try {
      await db.delete(education).where(eq(education.id, educationId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
