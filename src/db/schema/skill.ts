import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal";

export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [skills.personalId],
    references: [personalBasic.id],
  }),
}));

export type SkillInsert = typeof skills.$inferInsert;
