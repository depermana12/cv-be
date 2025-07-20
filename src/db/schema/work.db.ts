import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  text,
  date,
  boolean,
} from "drizzle-orm/pg-core";

import { cv } from "./cv.db";

export const works = pgTable("works", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cvId: integer("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  company: varchar("company", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  url: varchar("url", { length: 255 }),
  isCurrent: boolean("is_current").default(false),
  descriptions: text("descriptions").array(),
  location: varchar("location", { length: 100 }),
  displayOrder: integer("display_order"),
});

export const workRelations = relations(works, ({ one }) => ({
  cv: one(cv, {
    fields: [works.cvId],
    references: [cv.id],
  }),
}));
