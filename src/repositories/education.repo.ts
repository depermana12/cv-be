import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
} from "../db/schema/education.db";

export class EducationRepository extends BaseRepository<
  typeof educations,
  EducationInsert
> {
  constructor() {
    super(db, educations);
  }
  async getAllByPersonalId(personalId: number): Promise<EducationSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
