import { pgTable, integer, varchar, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const skills = pgTable("skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 255 }).notNull(),
  skill: text("skill").array().notNull(),
  displayOrder: integer("display_order"),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  cv: one(cv, {
    fields: [skills.cvId],
    references: [cv.id],
  }),
}));
