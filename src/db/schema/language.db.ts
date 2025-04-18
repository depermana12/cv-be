import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { basicTable } from "./personal.db";

export const language = mysqlTable("language", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => basicTable.id),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: varchar("fluency", { length: 25 }).notNull(),
});

export type LanguageSelect = typeof language.$inferSelect;
export type LanguageInsert = Omit<typeof language.$inferInsert, "personalId">;
