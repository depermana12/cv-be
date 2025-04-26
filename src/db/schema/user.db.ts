import { relations } from "drizzle-orm";
import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { personal } from "./personal.db";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  personals: many(personal),
}));

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users, {
  email: z.string().email({ message: "invalid email address" }),
}).omit({
  id: true,
  createdAt: true,
});
export const userLoginSchema = userInsertSchema.omit({ username: true });
export const userUpdateSchema = createInsertSchema(users);

export const userInputEmail = createInsertSchema(users, {
  email: z.string().email({ message: "You will receive an email" }),
}).pick({ email: true });

export const userInputResetPassword = z
  .object({
    password: z
      .string()
      .min(8, { message: "password required minimal 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "please confirm your password" }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "confirm password is not the same as password",
        path: ["confirmPassword"],
      });
    }
  });

export type UserSelect = z.infer<typeof userSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
