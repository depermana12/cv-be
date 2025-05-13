import type {
  organizationDesc,
  organizations,
} from "../schema/organization.db";

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = Omit<
  typeof organizations.$inferInsert,
  "personalId"
>;
export type OrganizationDescInsert = Omit<
  typeof organizationDesc.$inferInsert,
  "organizationId"
>;
