import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import { intro } from "./intro.db";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export const userLoginSchema = userInsertSchema.omit({ username: true });

export const userUpdateSchema = createInsertSchema(users);

export type UserSelect = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userRelations = relations(users, ({ one }) => ({
  intro: one(intro),
}));
