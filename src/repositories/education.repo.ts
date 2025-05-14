import { eq } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
} from "../db/types/education.type";

export class EducationRepository extends BaseRepository<
  typeof educations,
  EducationInsert
> {
  constructor() {
    super(educations);
  }
  async getAllByPersonalId(personalId: number): Promise<EducationSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
