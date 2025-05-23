import { z } from "zod";

/**
 *  This schema is used to validate the user data registration.
 *  please do not confuse if in auth schema there is no registration,
 *  this schema is used for user registration.
 */

export const userSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50),
  email: z.string().email({ message: "Invalid email address" }).max(100),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(255),
  isEmailVerified: z.boolean().optional(),
  createdAt: z.date().optional(),
});

export const userInsertSchema = userSchema.omit({
  id: true,
  isEmailVerified: true,
  createdAt: true,
});

export const userUpdateSchema = userSchema.partial();

export type UserSelect = z.infer<typeof userSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
