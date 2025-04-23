import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { personal } from "./personal.db";

export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  personal: one(personal, {
    fields: [skills.personalId],
    references: [personal.id],
  }),
}));

export type SkillSelect = typeof skills.$inferSelect;
export type SkillInsert = Omit<typeof skills.$inferInsert, "personalId">;
