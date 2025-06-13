import type {
  organizationDesc,
  organizations,
} from "../schema/organization.db";

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
export type OrganizationUpdate = Partial<
  Omit<OrganizationInsert, "id" | "cvId">
>;

export type OrganizationDescSelect = typeof organizationDesc.$inferSelect;
export type OrganizationDescInsert = typeof organizationDesc.$inferInsert;
export type OrganizationDescUpdate = Partial<
  Omit<OrganizationDescInsert, "id" | "organizationId">
>;

export type OrganizationResponse = OrganizationSelect & {
  descriptions: OrganizationDescSelect[];
};

export type OrganizationCreateRequest = Omit<
  OrganizationInsert,
  "id" | "cvId"
> & {
  descriptions?: Omit<OrganizationDescInsert, "id" | "organizationId">[];
};

export type OrganizationUpdateRequest = Partial<
  Omit<OrganizationInsert, "id" | "cvId">
> & {
  descriptions?: Omit<OrganizationDescInsert, "id" | "organizationId">[];
};

export type OrganizationQueryOptions = {
  search?: string;
  sortBy?: keyof OrganizationSelect;
  sortOrder?: "asc" | "desc";
};
