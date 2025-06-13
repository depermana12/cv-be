import { CvChildRepository } from "./cvChild.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
  EducationUpdate,
  EducationQueryOptions,
} from "../db/types/education.type";
import type { Database } from "../db";

import { eq, like, and, desc, asc, sql } from "drizzle-orm";

export class EducationRepository extends CvChildRepository<
  typeof educations,
  EducationInsert,
  EducationSelect,
  EducationUpdate
> {
  constructor(db: Database) {
    super(educations, db);
  }
  async getAllEducations(
    cvId: number,
    options?: EducationQueryOptions,
  ): Promise<EducationSelect[]> {
    const whereClause = [eq(educations.cvId, cvId)];

    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${educations.institution})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    return this.db.query.educations.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(educations[options.sortBy])
              : asc(educations[options.sortBy]),
          ]
        : [],
    });
  }
}
