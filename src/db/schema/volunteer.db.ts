import { relations } from "drizzle-orm";
import { pgTable, integer, varchar, text, date } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const volunteers = pgTable("volunteers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  organization: varchar("organization", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
  descriptions: text("descriptions").array(),
  displayOrder: integer("display_order"),
});

export const volunteersRelations = relations(volunteers, ({ one }) => ({
  cv: one(cv, {
    fields: [volunteers.cvId],
    references: [cv.id],
  }),
}));
