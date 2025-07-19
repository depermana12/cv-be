import type { projects } from "../schema/project.db";

export type ProjectSelect = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
export type ProjectUpdate = Partial<
  Omit<typeof projects.$inferInsert, "id" | "cvId">
>;
