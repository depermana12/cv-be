import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

import { personal } from "./personal.db";

export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personal: one(personal, {
    fields: [softSkills.personalId],
    references: [personal.id],
  }),
}));

export type SoftSkillSelect = typeof softSkills.$inferSelect;
export type SoftSkillInsert = Omit<
  typeof softSkills.$inferInsert,
  "personalId"
>;
