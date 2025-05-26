import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { skills } from "../db/schema/skill.db";
import type {
  SkillInsert,
  SkillQueryOptions,
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
  async getCategories(): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ category: skills.category })
      .from(this.table);
    const categories = rows.map((row: { category: string }) => row.category);
    return categories;
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

    return this.db.query.skills.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(skills[options.sortBy])
              : asc(skills[options.sortBy]),
          ]
        : [],
    });
  }
}
