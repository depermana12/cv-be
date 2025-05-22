import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
} from "../db/types/education.type";
import { getDb } from "../db";

const db = await getDb();
export class EducationRepository extends CvChildRepository<
  typeof educations,
  EducationInsert
> {
  constructor() {
    super(educations, db);
  }
  async getAllByPersonalId(personalId: number): Promise<EducationSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
