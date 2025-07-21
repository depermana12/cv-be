import { pgTable, integer, varchar, pgEnum } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const fluencyEnum = pgEnum("fluency", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const languages = pgTable("languages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: fluencyEnum("fluency").default("beginner"),
  displayOrder: integer("display_order"),
});

export const languageRelations = relations(languages, ({ one }) => ({
  cv: one(cv, {
    fields: [languages.cvId],
    references: [cv.id],
  }),
}));
