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

export type ProjectWithDescriptionsAndTechSelect = ProjectSelect & {
  descriptions: ProjectDescSelect[];
  technologies: ProjectTechSelect[];
};

export type ProjectWithDescAndTechInsert = {
  project: Omit<ProjectInsert, "cvId">;
  descriptions: ProjectDescInsert[];
  technologies: ProjectTechInsert[];
};

export type ProjectWithDescAndTechUpdate = {
  project?: Partial<Omit<ProjectUpdate, "cvId">>;
  descriptions?: ProjectDescUpdate[];
  technologies?: ProjectTechUpdate[];
};

export type ProjectWithDescriptions = ProjectSelect & {
  descriptions: ProjectDescSelect[];
};

export type ProjectWithTech = ProjectSelect & {
  technologies: ProjectTechSelect[];
};

export type ProjectQueryOptions = {
  search?: string;
  sortBy?: keyof ProjectSelect;
  sortOrder?: "asc" | "desc";
};

export type ProjectWithDescriptionsAndTech = ProjectWithDescriptions & {
  technologies: ProjectTechSelect[];
};
