import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { skills } from "../db/schema/skill.db";
import type { SkillInsert } from "../db/schema/skill.db";

export class SkillRepository extends BaseRepository<
  typeof skills,
  SkillInsert
> {
  constructor() {
    super(skills, "id");
  }
  async getCategories() {
    try {
      const rows = await db
        .selectDistinct({ category: skills.category })
        .from(skills);
      const categories = rows.map((row) => row.category);
      return categories;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
