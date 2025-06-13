import type { workDescriptions, works } from "../schema/work.db";

export type WorkSelect = typeof works.$inferSelect;
export type WorkInsert = typeof works.$inferInsert;
export type WorkUpdate = Partial<Omit<WorkInsert, "id" | "cvId">>;

export type WorkDescSelect = typeof workDescriptions.$inferSelect;
export type WorkDescInsert = typeof workDescriptions.$inferInsert;
export type WorkDescUpdate = Partial<Omit<WorkDescInsert, "id" | "workId">>;

// Composite types
export type WorkResponse = WorkSelect & {
  descriptions: WorkDescSelect[];
};

// API operation types
export type WorkCreateRequest = Omit<WorkInsert, "id" | "cvId"> & {
  descriptions?: Omit<WorkDescInsert, "id" | "workId">[];
};
export type WorkUpdateRequest = Partial<Omit<WorkInsert, "id" | "cvId">> & {
  descriptions?: Omit<WorkDescInsert, "id" | "workId">[];
};
export type WorkQueryOptions = {
  search?: string;
  sortBy?: keyof WorkSelect;
  sortOrder?: "asc" | "desc";
};
