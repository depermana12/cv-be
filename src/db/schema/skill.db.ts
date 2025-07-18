import { pgTable, integer, varchar, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const skills = pgTable("skills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),

  type: pgEnum("skill_type", ["technical", "soft", "language", "tool"])(
    "type",
  ).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  proficiency: pgEnum("proficiency_level", [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ])("proficiency"),
  keywords: text("keywords").array(),
  description: text("description"),
  displayOrder: integer("display_order"),
});

export const skillsRelations = relations(skills, ({ one }) => ({
  cv: one(cv, {
    fields: [skills.cvId],
    references: [cv.id],
  }),
}));
