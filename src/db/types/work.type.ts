import type { workDescriptions, works } from "../schema/work.db";

export type WorkSelect = typeof works.$inferSelect;
export type WorkInsert = typeof works.$inferInsert;
export type WorkUpdate = Partial<Omit<WorkInsert, "id" | "cvId">>;

export type WorkDescSelect = typeof workDescriptions.$inferSelect;
export type WorkDescInsert = typeof workDescriptions.$inferInsert;
export type WorkDescUpdate = Partial<Omit<WorkDescInsert, "id" | "workId">>;

export type WorkWithDescriptions = WorkSelect & {
  descriptions: WorkDescSelect[];
};

export type WorkQueryOptions = {
  search?: string;
  sortBy?: keyof WorkSelect;
  sortOrder?: "asc" | "desc";
};
