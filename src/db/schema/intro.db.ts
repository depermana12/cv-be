import { mysqlTable, text, varchar, int } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./user.db";
import { z } from "zod";

export const intro = mysqlTable("intro", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  fullName: varchar("full_name", { length: 100 }),
  bio: varchar("bio", { length: 255 }),
  image: varchar("image", { length: 255 }),
  summary: text("summary"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  url: varchar("url", { length: 255 }),
});

export const introSelectSchema = createSelectSchema(intro);
export const introInsertSchema = createInsertSchema(intro).omit({
  userId: true,
});
export const introUpdateSchema = introInsertSchema;

export type IntroSelect = z.infer<typeof introSelectSchema>;
export type IntroInsert = z.infer<typeof introInsertSchema>;
export type IntroUpdate = z.infer<typeof introUpdateSchema>;
