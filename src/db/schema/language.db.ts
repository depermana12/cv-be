import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const languages = mysqlTable("languages", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: varchar("fluency", { length: 25 }).notNull(),
});

export const languageRelations = relations(languages, ({ one }) => ({
  cv: one(cv, {
    fields: [languages.cvId],
    references: [cv.id],
  }),
}));
