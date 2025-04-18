import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

import { basicTable } from "./personal.db";

export const work = mysqlTable("work_exp", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => basicTable.id),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
  isCurrent: boolean("is_current").default(false),
});

export const workDetails = mysqlTable("work_exp_details", {
  id: int("id").primaryKey().autoincrement(),
  workId: int("work_exp_id")
    .notNull()
    .references(() => work.id),
  description: text("description"),
});

export const workRelations = relations(work, ({ one }) => ({
  personal: one(basicTable, {
    fields: [work.personalId],
    references: [basicTable.id],
  }),
  details: one(workDetails, {
    fields: [work.id],
    references: [workDetails.workId],
  }),
}));

export type WorkInsert = Omit<typeof work.$inferInsert, "personalId">;
export type WorkDetailInsert = Omit<typeof workDetails.$inferInsert, "workId">;
