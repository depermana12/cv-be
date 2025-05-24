import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  cv: one(cv, {
    fields: [softSkills.cvId],
    references: [cv.id],
  }),
}));
