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
  "id"
> {
  constructor(db: Database) {
    super(educations, db, "id");
  }

  async createEducation(
    cvId: number,
    educationData: EducationInsert,
  ): Promise<EducationSelect> {
    return this.createInCv(cvId, educationData);
  }

  async getEducation(
    cvId: number,
    educationId: number,
  ): Promise<EducationSelect | null> {
    return this.getByIdInCv(cvId, educationId);
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

    return this.db
      .select()
      .from(educations)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(educations[options.sortBy])
            : asc(educations[options.sortBy])
          : asc(educations.id),
      );
  }

  async updateEducation(
    cvId: number,
    educationId: number,
    educationData: EducationUpdate,
  ): Promise<EducationSelect> {
    return this.updateInCv(cvId, educationId, educationData);
  }

  async deleteEducation(cvId: number, educationId: number): Promise<boolean> {
    return this.deleteInCv(cvId, educationId);
  }
}
