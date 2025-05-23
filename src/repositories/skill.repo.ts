import { CvChildRepository } from "./cvChild.repo";
import { skills } from "../db/schema/skill.db";
import type {
  SkillInsert,
  SkillSelect,
  SkillUpdate,
} from "../db/types/skill.type";
import { getDb } from "../db";

const db = await getDb();
export class SkillRepository extends CvChildRepository<
  typeof skills,
  SkillInsert,
  SkillSelect,
  SkillUpdate
> {
  constructor() {
    super(skills, db);
  }
  async getCategories() {
    const rows = await this.db
      .selectDistinct({ category: skills.category })
      .from(this.table);
    const categories = rows.map((row: { category: any }) => row.category);
    return categories;
  }
}
