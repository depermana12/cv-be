import type { educations } from "../schema/education.db";

export type EducationSelect = typeof educations.$inferSelect;
export type EducationInsert = typeof educations.$inferInsert;
export type EducationUpdate = Partial<Omit<EducationInsert, "id" | "cvId">>;

export type EducationQueryOptions = {
  search?: string;
  sortBy?: keyof EducationSelect;
  sortOrder?: "asc" | "desc";
};
