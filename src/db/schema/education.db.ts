import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  date,
  decimal,
} from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const educations = mysqlTable("educations", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  institution: varchar("institution", { length: 100 }).notNull(),
  degree: varchar("degree", { length: 100 }).notNull(),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  url: varchar("url", { length: 255 }),
});

export const educationRelations = relations(educations, ({ one }) => ({
  cv: one(cv, {
    fields: [educations.cvId],
    references: [cv.id],
  }),
}));
