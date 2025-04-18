import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { basicTable } from "./personal.db";

export const organization = mysqlTable("org_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => basicTable.id),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const organizationDetails = mysqlTable("org_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  organizationId: int("org_exp_id")
    .notNull()
    .references(() => organization.id),
  description: text("description"),
});

export const organizationRelations = relations(organization, ({ one }) => ({
  personal: one(basicTable, {
    fields: [organization.personalId],
    references: [basicTable.id],
  }),
  details: one(organizationDetails, {
    fields: [organization.id],
    references: [organizationDetails.organizationId],
  }),
}));

export const organizationDetailsRelations = relations(
  organizationDetails,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationDetails.organizationId],
      references: [organization.id],
    }),
  }),
);

export type OrganizationInsert = Omit<
  typeof organization.$inferInsert,
  "personalId"
>;
export type OrganizationDetailInsert = Omit<
  typeof organizationDetails.$inferInsert,
  "organizationId"
>;
