import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
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
    super(db, education);
  }
  async getAllByPersonalId(personalId: number): Promise<EducationSelect[]> {
    return this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
  }
}
