import type { languages } from "../schema/language.db";

export type LanguageSelect = typeof languages.$inferSelect;
export type LanguageInsert = typeof languages.$inferInsert;
export type LanguageUpdate = Partial<Omit<LanguageInsert, "id" | "cvId">>;

export type LanguageQueryOptions = {
  search?: string;
  sortBy?: keyof LanguageSelect;
  sortOrder?: "asc" | "desc";
};
