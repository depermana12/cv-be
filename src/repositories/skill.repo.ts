import { BaseRepository } from "./base.repo";
import { skills } from "../db/schema/skill.db";
import type { SkillInsert } from "../db/types/skill.type";

export class SkillRepository extends BaseRepository<
  typeof skills,
  SkillInsert
> {
  constructor() {
    super(skills);
  }
  async getCategories() {
    const rows = await this.db
      .selectDistinct({ category: skills.category })
      .from(this.table);
    const categories = rows.map((row: { category: any }) => row.category);
    return categories;
  }
}
