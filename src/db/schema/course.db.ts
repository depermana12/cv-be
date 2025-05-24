import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const courseDescriptions = mysqlTable("course_descriptions", {
  id: int("id").primaryKey().autoincrement(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  description: text("description"),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  cv: one(cv, {
    fields: [courses.cvId],
    references: [cv.id],
  }),
  descriptions: many(courseDescriptions),
}));

export const courseDescriptionRelations = relations(
  courseDescriptions,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseDescriptions.courseId],
      references: [courses.id],
    }),
  }),
);
