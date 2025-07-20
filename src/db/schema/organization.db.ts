import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, text, date } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  descriptions: text("descriptions").array(),
  location: varchar("location", { length: 100 }),
  displayOrder: integer("display_order"),
});

export const organizationRelations = relations(organizations, ({ one }) => ({
  cv: one(cv, {
    fields: [organizations.cvId],
    references: [cv.id],
  }),
}));
