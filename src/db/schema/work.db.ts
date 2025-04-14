import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal.db";

export const workExperience = mysqlTable("work_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
  isCurrent: boolean("is_current").default(false),
});

export const workExperienceDetails = mysqlTable("work_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  workExperienceId: int("work_exp_id")
    .notNull()
    .references(() => workExperience.id),
  description: text("description"),
});

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  personalInfo: one(personalBasic, {
    fields: [workExperience.personalId],
    references: [personalBasic.id],
  }),
  details: one(workExperienceDetails, {
    fields: [workExperience.id],
    references: [workExperienceDetails.workExperienceId],
  }),
}));

export type WorkInsert = typeof workExperience.$inferInsert;
export type WorkDetailInsert = typeof workExperienceDetails.$inferInsert;
