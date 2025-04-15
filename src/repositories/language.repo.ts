import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { language } from "../db/schema/language.db";
import type { LanguageInsert, LanguageSelect } from "../db/schema/language.db";

export class LanguageRepository extends BaseRepository<typeof language> {
  constructor() {
    super(language, "id");
  }

  async createWithPersonalId(
    personalId: number,
    data: Omit<LanguageInsert, "personalId">,
  ) {
    const fullData: LanguageInsert = { ...data, personalId };
    return await db.insert(this.table).values(fullData);
  }

  async getAllByPersonalId(personalId: number): Promise<LanguageSelect[]> {
    const rows = await db
      .select()
      .from(this.table)
      .where(eq(this.table.personalId, personalId));
    return rows;
  }
}
