import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
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

const socialRelations = relations(socials, ({ one }) => ({
  personal: one(personal, {
    fields: [socials.personalId],
    references: [personal.id],
  }),
}));

export const socialSelectSchema = createSelectSchema(socials);
export const socialInsertSchema = createInsertSchema(socials);
export const socialUpdateSchema = createUpdateSchema(socials).omit({
  personalId: true,
  id: true,
});

export type SocialSelect = z.infer<typeof socialSelectSchema>;
export type SocialInsert = z.infer<typeof socialInsertSchema>;
export type SocialUpdate = z.infer<typeof socialUpdateSchema>;
