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
  profileImage: z
    .string()
    .url({ message: "Invalid image URL" })
    .optional()
    .nullable(),
  birthDate: z.coerce
    .date({ invalid_type_error: "Invalid birth date" })
    .optional()
    .nullable(),
  firstName: z
    .string()
    .max(50, { message: "First name must be 50 characters or fewer" })
    .optional()
    .nullable(),
  lastName: z
    .string()
    .max(50, { message: "Last name must be 50 characters or fewer" })
    .optional()
    .nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userInsertSchema = userSchema.omit({
  id: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
});

export const userUpdateSchema = userSchema
  .pick({
    profileImage: true,
    birthDate: true,
    firstName: true,
    lastName: true,
    gender: true,
  })
  .partial();

export const userCredentialsUpdateSchema = userSchema
  .pick({
    username: true,
    email: true,
  })
  .partial();
