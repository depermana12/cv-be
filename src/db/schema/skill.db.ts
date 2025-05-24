import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const skills = mysqlTable("skills", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  cv: one(cv, {
    fields: [skills.cvId],
    references: [cv.id],
  }),
}));
