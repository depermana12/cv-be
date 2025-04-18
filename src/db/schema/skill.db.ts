import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

import { basicTable } from "./personal.db";

export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  personal: one(basicTable, {
    fields: [skills.personalId],
    references: [basicTable.id],
  }),
}));

export type SkillInsert = Omit<typeof skills.$inferInsert, "personalId">;
