import { relations } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  text,
  date,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

import { personalBasic } from "./personal.db";

export const language = mysqlTable("language", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personalBasic.id),
  language: varchar("language", { length: 100 }).notNull(),
  fluency: varchar("fluency", { length: 25 }).notNull(),
});

export type LanguageInsert = typeof language.$inferInsert;
export type LanguageSelect = typeof language.$inferSelect;
