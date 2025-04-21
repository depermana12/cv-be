import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

import { intro } from "./personal.db";

export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personal: one(intro, {
    fields: [softSkills.personalId],
    references: [intro.id],
  }),
}));

export type SoftSkillSelect = typeof softSkills.$inferSelect;
export type SoftSkillInsert = Omit<
  typeof softSkills.$inferInsert,
  "personalId"
>;
