import type { courses } from "../schema/course.db";

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = typeof courses.$inferInsert;
export type CourseUpdate = Partial<
  Omit<typeof courses.$inferInsert, "id" | "cvId">
>;
