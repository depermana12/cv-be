import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  date,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { cv } from "./cv.db";

export const educations = pgTable("educations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  institution: varchar("institution", { length: 100 }).notNull(),
  degree: pgEnum("education_type", [
    "high_school",
    "diploma",
    "bachelor",
    "master",
    "doctorate",
  ])("degree").notNull(),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  url: varchar("url", { length: 255 }),
  displayOrder: integer("display_order"),
  location: varchar("location", { length: 100 }),
  description: text("description").array(),
});

export const educationRelations = relations(educations, ({ one }) => ({
  cv: one(cv, {
    fields: [educations.cvId],
    references: [cv.id],
  }),
}));
