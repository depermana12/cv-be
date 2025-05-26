import { location } from "../schema/location.db";

export type LocationSelect = typeof location.$inferSelect;
export type LocationInsert = typeof location.$inferInsert;
export type LocationUpdate = Partial<Omit<LocationInsert, "id" | "cvId">>;

export type LocationQueryOptions = {
  search?: string;
  sortBy?: keyof LocationSelect;
  sortOrder?: "asc" | "desc";
};
