import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal";

export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [softSkills.personalId],
    references: [personalBasic.id],
  }),
}));

export type SoftSkillInsert = typeof softSkills.$inferInsert;
