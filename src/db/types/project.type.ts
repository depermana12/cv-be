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

export type ProjectTechStackSelect = typeof projectTechnologies.$inferSelect;
export type ProjectTechStackInsert = typeof projectTechnologies.$inferInsert;
export type ProjectTechStackUpdate = Partial<
  Omit<typeof projectTechnologies.$inferInsert, "id" | "projectId">
>;

export type ProjectWithDescriptionsAndTechStackSelect = ProjectSelect & {
  descriptions: ProjectDescSelect[];
  technologies: ProjectTechStackSelect[];
};

export type ProjectWithDescAndTechStackInsert = {
  project: Omit<ProjectInsert, "cvId">;
  descriptions: ProjectDescInsert[];
  technologies: ProjectTechStackInsert[];
};

export type ProjectWithDescAndTechStackUpdate = {
  project?: Partial<Omit<ProjectUpdate, "cvId">>;
  descriptions?: ProjectDescUpdate[];
  technologies?: ProjectTechStackUpdate[];
};

export type ProjectWithDescriptions = ProjectSelect & {
  descriptions: ProjectDescSelect[];
};

export type ProjectWithTechStack = ProjectSelect & {
  technologies: ProjectTechStackSelect[];
};

export type ProjectQueryOptions = {
  search?: string;
  sortBy?: keyof ProjectSelect;
  sortOrder?: "asc" | "desc";
};

export type ProjectWithDescriptionsAndTechStack = ProjectWithDescriptions & {
  technologies: ProjectTechStackSelect[];
};
