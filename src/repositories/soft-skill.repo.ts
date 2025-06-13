import { CvChildRepository } from "./cvChild.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type {
  SoftSkillInsert,
  SoftSkillQueryOptions,
  SoftSkillSelect,
  SoftSkillUpdate,
} from "../db/types/soft-skill.type";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import type { Database } from "../db/index";
export class SoftSkillRepository extends CvChildRepository<
  typeof softSkills,
  SoftSkillInsert,
  SoftSkillSelect,
  SoftSkillUpdate
> {
  constructor(db: Database) {
    super(softSkills, db);
  }

  async getAllSoftSkills(
    cvId: number,
    options?: SoftSkillQueryOptions,
  ): Promise<SoftSkillSelect[]> {
    const whereClause = [eq(softSkills.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${softSkills.category})`, searchTerm));
    }

    return this.db.query.softSkills.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(softSkills[options.sortBy])
              : asc(softSkills[options.sortBy]),
          ]
        : [],
    });
  }
}
