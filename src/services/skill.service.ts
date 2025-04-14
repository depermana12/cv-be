import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { skills } from "../db/schema/skill.db";
import type { SkillInsert } from "../db/index.types";

export class Skill {
  async getAll() {
    try {
      return await db.select().from(skills);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(skillId: number) {
    try {
      const rows = await db.select().from(skills).where(eq(skills.id, skillId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getCategories() {
    try {
      // const rows = await db.select().from(skills);
      // const unique = new Set(rows.map((row) => row.category));
      // const categories = Array.from(unique);
      // return categories;

      const rows = await db
        .selectDistinct({ category: skills.category })
        .from(skills);
      const categories = rows.map((row) => row.category);
      return categories;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(skill: SkillInsert) {
    try {
      const insertedSkill = await db
        .insert(skills)
        .values(skill)
        .$returningId();
      return await this.getById(insertedSkill[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(skillId: number, newSkillData: Partial<SkillInsert>) {
    try {
      await db.update(skills).set(newSkillData).where(eq(skills.id, skillId));
      return this.getById(skillId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(skillId: number) {
    try {
      await db.delete(skills).where(eq(skills.id, skillId));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
