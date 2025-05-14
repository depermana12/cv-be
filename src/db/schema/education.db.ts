import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  date,
  decimal,
} from "drizzle-orm/mysql-core";

import { personal } from "./personal.db";

export const educations = mysqlTable("educations", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  institution: varchar("institution", { length: 100 }).notNull(),
  degree: varchar("degree", { length: 100 }).notNull(),
  fieldOfStudy: varchar("field_of_study", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  url: varchar("url", { length: 255 }),
});

export const educationRelations = relations(educations, ({ one }) => ({
  personal: one(personal, {
    fields: [educations.personalId],
    references: [personal.id],
  }),
}));
