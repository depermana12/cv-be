import type { projectTechnologies } from "../schema/project.db";

export type ProjectTechSelect = typeof projectTechnologies.$inferSelect;
export type ProjectTechInsert = typeof projectTechnologies.$inferInsert;
export type ProjectTechUpdate = Partial<
  Omit<typeof projectTechnologies.$inferInsert, "id" | "projectId">
>;

export type ProjectTechQueryOptions = {
  search?: string;
  sortBy?: keyof ProjectTechSelect;
  sortOrder?: "asc" | "desc";
};
