import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, text, date } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id),
  name: varchar("name", { length: 100 }).notNull(),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  url: varchar("url", { length: 255 }),
  descriptions: text("descriptions").array(),
  technologies: text("technologies").array(),
  displayOrder: integer("display_order"),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  cv: one(cv, {
    fields: [projects.cvId],
    references: [cv.id],
  }),
}));
