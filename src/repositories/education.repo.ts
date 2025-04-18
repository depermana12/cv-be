import { eq } from "drizzle-orm";

import { BaseRepository } from "./base.repo";
import { db } from "../db/index";
import { education } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
} from "../db/schema/education.db";

export class EducationRepository extends BaseRepository<
  typeof education,
  EducationInsert
> {
  constructor() {
    super(education, "id");
  }
  async getAllByPersonalId(personalId: number): Promise<EducationSelect[]> {
    return db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
