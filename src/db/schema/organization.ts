import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal";

export const organizationExperience = mysqlTable("org_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const orgExpDetails = mysqlTable("org_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  organizationExperienceId: int("org_exp_id")
    .notNull()
    .references(() => organizationExperience.id),
  description: text("description"),
});

export const orgExpRelations = relations(organizationExperience, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [organizationExperience.personalId],
    references: [personalBasic.id],
  }),
  details: one(orgExpDetails, {
    fields: [organizationExperience.id],
    references: [orgExpDetails.organizationExperienceId],
  }),
}));

export const orgExpDetailsRelations = relations(orgExpDetails, ({ one }) => ({
  organizationExperience: one(organizationExperience, {
    fields: [orgExpDetails.organizationExperienceId],
    references: [organizationExperience.id],
  }),
}));

export type OrganizationInsert = typeof organizationExperience.$inferInsert;
export type OrganizationDetailInsert = typeof orgExpDetails.$inferInsert;
