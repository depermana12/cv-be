import { eq } from "drizzle-orm";
import { CvChildRepository } from "../cvChild.repo";
import { skills } from "../../db/schema/skill.db";
import type { SkillInsert, SkillSelect } from "../../db/types/skill.type";
import type { Database } from "../../db/index";

export interface ISkillRepository {
  getCategoriesForCv(cvId: number): Promise<{ category: string }[]>;
}

export class SkillRepository
  extends CvChildRepository<typeof skills, SkillInsert, SkillSelect, "id">
  implements ISkillRepository
{
  constructor(db: Database) {
    super(skills, db, "id");
  }

  async getCategoriesForCv(cvId: number) {
    return this.db
      .selectDistinct({ category: skills.category })
      .from(skills)
      .where(eq(skills.cvId, cvId));
  }
}
