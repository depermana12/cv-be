import type { projects, projectTechnologies } from "../schema";
import type { projectDescription } from "../schema/project.db";

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = Omit<typeof projects.$inferInsert, "personalId">;
export type ProjectDescInsert = Omit<
  typeof projectDescription.$inferInsert,
  "projectId"
>;
export type ProjectDetailsSelect = typeof projectDescription.$inferSelect;
export type ProjectTechStackSelect = typeof projectTechnologies.$inferSelect;
export type ProjectTechStackInsert = Omit<
  typeof projectTechnologies.$inferInsert,
  "projectId"
>;
