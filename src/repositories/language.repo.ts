import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { language } from "../db/schema/language.db";
import type { LanguageInsert, LanguageSelect } from "../db/schema/language.db";

export class LanguageRepository extends BaseRepository<
  typeof language,
  LanguageInsert
> {
  constructor() {
    super(language, "id");
  }

  async createWithPersonalId(personalId: number, data: LanguageInsert) {
    return await db.insert(this.table).values({ ...data, personalId });
  }

  async getAllByPersonalId(personalId: number): Promise<LanguageSelect[]> {
    const rows = await db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
    return rows;
  }
}
