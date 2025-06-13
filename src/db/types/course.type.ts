import type { courseDescriptions, courses } from "../schema/course.db";

export type CourseSelect = typeof courses.$inferSelect;
export type CourseInsert = typeof courses.$inferInsert;
export type CourseUpdate = Partial<
  Omit<typeof courses.$inferInsert, "id" | "cvId">
>;

export type CourseDescSelect = typeof courseDescriptions.$inferSelect;
export type CourseDescInsert = typeof courseDescriptions.$inferInsert;
export type CourseDescUpdate = Partial<
  Omit<typeof courseDescriptions.$inferInsert, "id" | "courseId">
>;

export type CourseResponse = CourseSelect & {
  descriptions: CourseDescSelect[];
};

export type CourseCreateRequest = Omit<CourseInsert, "id" | "cvId"> & {
  descriptions?: Omit<CourseDescInsert, "id" | "courseId">[];
};

export type CourseUpdateRequest = Partial<Omit<CourseInsert, "id" | "cvId">> & {
  descriptions?: Omit<CourseDescInsert, "id" | "courseId">[];
};

export type CourseQueryOptions = {
  search?: string;
  sortBy?: keyof CourseSelect;
  sortOrder?: "asc" | "desc";
};
