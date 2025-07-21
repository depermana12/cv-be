import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, text, date } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const certifications = pgTable("certifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  organization: varchar("organization", { length: 100 }).notNull(),
  issueDate: date("issue_date", { mode: "date" }),
  expiryDate: date("expiry_date", { mode: "date" }),
  credentialId: varchar("credential_id", { length: 100 }),
  displayOrder: integer("display_order"),
  url: varchar("url", { length: 255 }),
  descriptions: text("descriptions").array(),
});

export const certificationsRelations = relations(certifications, ({ one }) => ({
  cv: one(cv, {
    fields: [certifications.cvId],
    references: [cv.id],
  }),
}));
