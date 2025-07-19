import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { skills } from "../db/schema/skill.db";
import type {
  SkillInsert,
  SkillQueryOptions,
  SkillSelect,
  SkillUpdate,
} from "../db/types/skill.type";

export interface ISkillRepository {
  getSkill(cvId: number, skillId: number): Promise<SkillSelect | null>;
  getCategoriesForCv(cvId: number): Promise<{ category: string }[]>;
  getAllSkills(
    cvId: number,
    options?: SkillQueryOptions,
  ): Promise<SkillSelect[]>;
  createSkill(cvId: number, skillData: SkillInsert): Promise<SkillSelect>;
  updateSkill(
    cvId: number,
    skillId: number,
    skillData: SkillUpdate,
  ): Promise<SkillSelect>;
  deleteSkill(cvId: number, skillId: number): Promise<boolean>;
}
import type { Database } from "../db/index";

export class SkillRepository
  extends CvChildRepository<typeof skills, SkillInsert, SkillSelect, "id">
  implements ISkillRepository
{
  constructor(db: Database) {
    super(skills, db, "id");
  }

  async getSkill(cvId: number, skillId: number) {
    return this.getByIdInCv(cvId, skillId);
  }

  async getCategoriesForCv(cvId: number) {
    return this.db
      .selectDistinct({ category: skills.category })
      .from(skills)
      .where(eq(skills.cvId, cvId));
  }

  async getAllSkills(cvId: number, options?: SkillQueryOptions) {
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

  async createSkill(cvId: number, skillData: SkillInsert) {
    return this.createInCv(cvId, skillData);
  }

  async updateSkill(cvId: number, skillId: number, skillData: SkillUpdate) {
    return this.updateInCv(cvId, skillId, skillData);
  }

  async deleteSkill(cvId: number, skillId: number) {
    return this.deleteInCv(cvId, skillId);
  }
}
