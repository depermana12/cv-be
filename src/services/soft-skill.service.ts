import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { softSkills } from "../db/schema/soft-skill.db";
import type { SoftSkillInsert } from "../db/index.types";

export class SoftSkill {
  async getAll() {
    try {
      return await db.select().from(softSkills);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(softSkillId: number) {
    try {
      const rows = await db
        .select()
        .from(softSkills)
        .where(eq(softSkills.id, softSkillId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(softSkill: SoftSkillInsert) {
    try {
      const insertedSoftSkill = await db
        .insert(softSkills)
        .values(softSkill)
        .$returningId();
      return await this.getById(insertedSoftSkill[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(softSkillId: number, newData: Partial<SoftSkillInsert>) {
    try {
      await db
        .update(softSkills)
        .set(newData)
        .where(eq(softSkills.id, softSkillId));
      return await this.getById(softSkillId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(softSkillId: number) {
    try {
      await db.delete(softSkills).where(eq(softSkills.id, softSkillId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
