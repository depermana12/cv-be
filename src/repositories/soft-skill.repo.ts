import { CvChildRepository } from "./cvChild.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type {
  SoftSkillInsert,
  SoftSkillQueryOptions,
  SoftSkillSelect,
  SoftSkillUpdate,
} from "../db/types/soft-skill.type";
import { getDb } from "../db";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

const db = await getDb();
export class SoftSkillRepository extends CvChildRepository<
  typeof softSkills,
  SoftSkillInsert,
  SoftSkillSelect,
  SoftSkillUpdate
> {
  constructor() {
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
