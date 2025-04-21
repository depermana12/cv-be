import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { intro } from "./personal.db";
import type { z } from "zod";

export const social = mysqlTable("personal_social", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  social: varchar("social", { length: 50 }),
  username: varchar("username", { length: 100 }),
  url: varchar("url", { length: 255 }),
});

export const socialSelectSchema = createSelectSchema(social);
export const socialInsertSchema = createInsertSchema(social);
export const socialUpdateSchema = createUpdateSchema(social).omit({
  personalId: true,
  id: true,
});

export type SocialSelect = z.infer<typeof socialSelectSchema>;
export type SocialInsert = z.infer<typeof socialInsertSchema>;
export type SocialUpdate = z.infer<typeof socialUpdateSchema>;
