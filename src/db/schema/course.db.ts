import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal.db";

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const courseDetails = mysqlTable("course_details", {
  id: int("id").primaryKey().autoincrement(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  description: text("description"),
});

export const coursesRelations = relations(courses, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [courses.personalId],
    references: [personalBasic.id],
  }),
  details: one(courseDetails, {
    fields: [courses.id],
    references: [courseDetails.courseId],
  }),
}));

export const courseDetailsRelations = relations(courseDetails, ({ one }) => ({
  course: one(courses, {
    fields: [courseDetails.courseId],
    references: [courses.id],
  }),
}));

export type CourseInsert = typeof courses.$inferInsert;
export type CourseSelect = typeof courses.$inferSelect;
export type CourseDetailsInsert = typeof courseDetails.$inferInsert;
