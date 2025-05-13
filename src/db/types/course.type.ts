import type { courses } from "../schema";
import type { courseDescriptions } from "../schema/course.db";

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = Omit<typeof courses.$inferInsert, "personalId">;
export type CourseDescInsert = Omit<
  typeof courseDescriptions.$inferInsert,
  "courseId"
>;
