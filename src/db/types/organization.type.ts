import type {
  organizationDesc,
  organizations,
} from "../schema/organization.db";

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
export type OrganizationUpdate = Partial<
  Omit<OrganizationInsert, "id" | "userId">
>;

export type OrganizationDescSelect = typeof organizationDesc.$inferSelect;
export type OrganizationDescInsert = typeof organizationDesc.$inferInsert;
export type OrganizationDescUpdate = Partial<
  Omit<OrganizationDescInsert, "id" | "organizationId">
>;

export type OrganizationWithDescriptions = OrganizationSelect & {
  descriptions: OrganizationDescSelect[];
};

export type OrganizationQueryOptions = {
  search?: string;
  sortBy?: keyof OrganizationSelect;
  sortOrder?: "asc" | "desc";
};
