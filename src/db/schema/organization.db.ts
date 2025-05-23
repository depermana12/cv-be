import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, text, date } from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const organizations = mysqlTable("organizations", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
});

export const organizationDesc = mysqlTable("organization_desc", {
  id: int("id").primaryKey().autoincrement(),
  organizationId: int("organization_id")
    .notNull()
    .references(() => organizations.id),
  description: text("description"),
});

export const organizationRelations = relations(
  organizations,
  ({ one, many }) => ({
    cv: one(cv, {
      fields: [organizations.cvId],
      references: [cv.id],
    }),
    descriptions: many(organizationDesc),
  }),
);

export const organizationDescRelations = relations(
  organizationDesc,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationDesc.organizationId],
      references: [organizations.id],
    }),
  }),
);
