import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { personal } from "./personal.db";

export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  courseName: varchar("course_name", { length: 200 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const courseDescriptions = mysqlTable("course_descriptions", {
  id: int("id").primaryKey().autoincrement(),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  description: text("description"),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  personal: one(personal, {
    fields: [courses.personalId],
    references: [personal.id],
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

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = Omit<typeof courses.$inferInsert, "personalId">;
export type CourseDescInsert = Omit<
  typeof courseDescriptions.$inferInsert,
  "courseId"
>;
