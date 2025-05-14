import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { personal } from "./personal.db";
import { relations } from "drizzle-orm";

export const languages = mysqlTable("languages", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: varchar("fluency", { length: 25 }).notNull(),
});

export const languageRelations = relations(languages, ({ one }) => ({
  personal: one(personal, {
    fields: [languages.personalId],
    references: [personal.id],
  }),
}));
