import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { personal } from "./personal.db";

export const socials = mysqlTable("socials", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  social: varchar("social", { length: 50 }),
  username: varchar("username", { length: 100 }),
  url: varchar("url", { length: 255 }),
});

export const socialRelations = relations(socials, ({ one }) => ({
  personal: one(personal, {
    fields: [socials.personalId],
    references: [personal.id],
  }),
}));
