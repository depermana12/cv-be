import type {
  projectDescription,
  projects,
  projectTechnologies,
} from "../schema/project.db";

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
export type ProjectUpdate = Partial<
  Omit<typeof projects.$inferInsert, "id" | "cvId">
>;

export type ProjectDescSelect = typeof projectDescription.$inferSelect;
export type ProjectDescInsert = typeof projectDescription.$inferInsert;
export type ProjectDescUpdate = Partial<
  Omit<typeof projectDescription.$inferInsert, "id" | "projectId">
>;

export type ProjectTechSelect = typeof projectTechnologies.$inferSelect;
export type ProjectTechInsert = typeof projectTechnologies.$inferInsert;
export type ProjectTechUpdate = Partial<
  Omit<typeof projectTechnologies.$inferInsert, "id" | "projectId">
>;

export type ProjectFullSelect = ProjectSelect & {
  descriptions: ProjectDescSelect[];
  technologies: ProjectTechSelect[];
};

export type ProjectFullInsert = Omit<ProjectInsert, "cvId"> & {
  descriptions?: Omit<ProjectDescInsert, "projectId">[];
  technologies?: Omit<ProjectTechInsert, "projectId">[];
};

export type ProjectFullUpdate = Partial<{
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  url: string;
  descriptions: Omit<ProjectDescInsert, "projectId">[];
  technologies: Omit<ProjectTechInsert, "projectId">[];
}>;

export type ProjectQueryOptions = {
  search?: string;
  sortBy?: keyof ProjectSelect;
  sortOrder?: "asc" | "desc";
};
