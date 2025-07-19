import type { Database } from "../db";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
  EducationUpdate,
  EducationQueryOptions,
} from "../db/types/education.type";

export interface IEducationRepository {
  createEducation(
    cvId: number,
    educationData: EducationInsert,
  ): Promise<EducationSelect>;
  getEducation(
    cvId: number,
    educationId: number,
  ): Promise<EducationSelect | null>;
  getAllEducations(
    cvId: number,
    options?: EducationQueryOptions,
  ): Promise<EducationSelect[]>;
  updateEducation(
    cvId: number,
    educationId: number,
    educationData: EducationUpdate,
  ): Promise<EducationSelect>;
  deleteEducation(cvId: number, educationId: number): Promise<boolean>;
}

export class EducationRepository
  extends CvChildRepository<
    typeof educations,
    EducationInsert,
    EducationSelect,
    "id"
  >
  implements IEducationRepository
{
  constructor(db: Database) {
    super(educations, db, "id");
  }

  async createEducation(cvId: number, educationData: EducationInsert) {
    return this.createInCv(cvId, educationData);
  }

  async getEducation(cvId: number, educationId: number) {
    return this.getByIdInCv(cvId, educationId);
  }

  async getAllEducations(cvId: number, options?: EducationQueryOptions) {
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
  ) {
    return this.updateInCv(cvId, educationId, educationData);
  }

  async deleteEducation(cvId: number, educationId: number) {
    return this.deleteInCv(cvId, educationId);
  }
}
