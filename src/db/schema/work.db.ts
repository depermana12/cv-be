import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  boolean,
} from "drizzle-orm/mysql-core";
import { cv } from "./cv.db";

export const works = mysqlTable("works", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  url: varchar("url", { length: 255 }),
  isCurrent: boolean("is_current").default(false),
});

export const workDescriptions = mysqlTable("work_descriptions", {
  id: int("id").primaryKey().autoincrement(),
  workId: int("work_id")
    .notNull()
    .references(() => works.id),
  description: text("description"),
});

export const workRelations = relations(works, ({ one, many }) => ({
  cv: one(cv, {
    fields: [works.cvId],
    references: [cv.id],
  }),
  descriptions: many(workDescriptions),
}));
