import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";

import { basicTable } from "./personal.db";

export const softSkills = mysqlTable("soft_skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => basicTable.id),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
});

export const softSkillsRelations = relations(softSkills, ({ one }) => ({
  personal: one(basicTable, {
    fields: [softSkills.personalId],
    references: [basicTable.id],
  }),
}));

export type SoftSkillInsert = Omit<
  typeof softSkills.$inferInsert,
  "personalId"
>;
