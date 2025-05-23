import {
  mysqlTable,
  text,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";

import { cv } from "./cv.db";
import { relations } from "drizzle-orm";

export const profile = mysqlTable("profile", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  bio: varchar("bio", { length: 255 }),
  image: varchar("image", { length: 255 }),
  summary: text("summary"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  url: varchar("url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profileRelations = relations(profile, ({ one }) => ({
  cv: one(cv, {
    fields: [profile.cvId],
    references: [cv.id],
  }),
}));
