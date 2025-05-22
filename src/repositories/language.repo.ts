import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { languages } from "../db/schema/language.db";
import type { LanguageInsert, LanguageSelect } from "../db/types/language.type";
import { getDb } from "../db";

const db = await getDb();
export class LanguageRepository extends CvChildRepository<
  typeof languages,
  LanguageInsert
> {
  constructor() {
    super(languages, db);
  }

  async createWithPersonalId(personalId: number, data: LanguageInsert) {
    return await this.db.insert(this.table).values({ ...data, personalId });
  }

  async getAllByPersonalId(personalId: number): Promise<LanguageSelect[]> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
    return rows;
  }
}
