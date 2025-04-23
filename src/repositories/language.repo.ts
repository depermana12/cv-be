import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { languages } from "../db/schema/language.db";
import type { LanguageInsert, LanguageSelect } from "../db/schema/language.db";

export class LanguageRepository extends BaseRepository<
  typeof languages,
  LanguageInsert
> {
  constructor() {
    super(db, languages);
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
