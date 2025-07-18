import type { organizations } from "../schema/organization.db";

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
export type OrganizationUpdate = Partial<
  Omit<OrganizationInsert, "id" | "cvId">
>;

export type OrganizationQueryOptions = {
  search?: string;
  sortBy?: keyof OrganizationSelect;
  sortOrder?: "asc" | "desc";
};
