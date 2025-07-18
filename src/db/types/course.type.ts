import type { courses } from "../schema/course.db";

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = typeof courses.$inferInsert;
export type CourseUpdate = Partial<
  Omit<typeof courses.$inferInsert, "id" | "cvId">
>;

export type CourseQueryOptions = {
  search?: string;
  sortBy?: keyof CourseSelect;
  sortOrder?: "asc" | "desc";
};
