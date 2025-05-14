import type { languages } from "../schema/language.db";

export type LanguageSelect = typeof languages.$inferSelect;
export type LanguageInsert = Omit<typeof languages.$inferInsert, "personalId">;
