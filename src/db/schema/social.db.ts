import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const socials = mysqlTable("socials", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  social: varchar("social", { length: 50 }),
  username: varchar("username", { length: 100 }),
  url: varchar("url", { length: 255 }),
});

export const socialRelations = relations(socials, ({ one }) => ({
  cv: one(cv, {
    fields: [socials.cvId],
    references: [cv.id],
  }),
}));
