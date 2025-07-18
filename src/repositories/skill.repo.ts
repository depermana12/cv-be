import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { skills } from "../db/schema/skill.db";
import type {
  SkillInsert,
  SkillQueryOptions,
  SkillSelect,
  SkillUpdate,
} from "../db/types/skill.type";
import type { Database } from "../db/index";

export class SkillRepository extends CvChildRepository<
  typeof skills,
  SkillInsert,
  SkillSelect,
  "id"
> {
  constructor(db: Database) {
    super(skills, db, "id");
  }

  async getSkill(cvId: number, skillId: number): Promise<SkillSelect | null> {
    return this.getByIdInCv(cvId, skillId);
  }

  async getCategoriesForCv(cvId: number): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ category: skills.category })
      .from(skills)
      .where(eq(skills.cvId, cvId));
    return rows.map((row: { category: string }) => row.category);
  }

  async getAllSkills(
    cvId: number,
    options?: SkillQueryOptions,
  ): Promise<SkillSelect[]> {
    const whereClause = [eq(skills.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${skills.name})`, searchTerm));
    }

    return this.db
      .select()
      .from(skills)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(skills[options.sortBy])
            : asc(skills[options.sortBy])
          : asc(skills.id),
      );
  }

  async createSkill(
    cvId: number,
    skillData: SkillInsert,
  ): Promise<SkillSelect> {
    return this.createInCv(cvId, skillData);
  }

  async updateSkill(
    cvId: number,
    skillId: number,
    skillData: SkillUpdate,
  ): Promise<SkillSelect> {
    return this.updateInCv(cvId, skillId, skillData);
  }

  async deleteSkill(cvId: number, skillId: number): Promise<boolean> {
    return this.deleteInCv(cvId, skillId);
  }
}
