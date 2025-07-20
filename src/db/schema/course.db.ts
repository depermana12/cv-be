import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, text, date } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  descriptions: text("descriptions").array(),
  displayOrder: integer("display_order"),
});

export const coursesRelations = relations(courses, ({ one }) => ({
  cv: one(cv, {
    fields: [courses.cvId],
    references: [cv.id],
  }),
}));
