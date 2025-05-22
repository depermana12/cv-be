import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./user.db";

export const cv = mysqlTable("cvs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull().unique(),
  description: text("description"),
  theme: varchar("theme", { length: 100 }).default("default"),
  isPublic: boolean("is_public").default(false),
  slug: varchar("slug", { length: 255 }).unique(),
  views: int("views").default(0),
  downloads: int("downloads").default(0),
  language: varchar("language", { length: 3 }).default("id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});
