import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { language } from "../db/schema/language";
import type { LanguageInsert } from "../db/index.types";

export class Language {
  async getById(id: number) {
    try {
      const rows = await db.select().from(language).where(eq(language.id, id));
      return rows[0] ?? null;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(personalId: number, data: LanguageInsert) {
    try {
      const [insertedLang] = await db
        .insert(language)
        .values({ ...data, personalId })
        .$returningId();
      return this.getById(insertedLang.id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getAllByPersonalId(personalId: number) {
    try {
      const rows = db
        .select()
        .from(language)
        .where(eq(language.personalId, personalId));
      return rows;
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(id: number, data: Partial<LanguageInsert>) {
    try {
      await db.update(language).set(data).where(eq(language.id, id));
      return this.getById(id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(id: number) {
    try {
      await db.delete(language).where(eq(language.id, id));
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
