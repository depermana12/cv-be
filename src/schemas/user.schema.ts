import { z } from "zod";

// Update user profile validation schema
export const updateUserSchema = z.object({
  profileImage: z.string().optional(),
  birthDate: z.coerce
    .date({ invalid_type_error: "Invalid birth date format" })
    .optional(),
  firstName: z
    .string()
    .max(50, { message: "First name must be 50 characters or fewer" })
    .optional(),
  lastName: z
    .string()
    .max(50, { message: "Last name must be 50 characters or fewer" })
    .optional(),
  gender: z
    .enum(["male", "female"], { message: "Please select a valid gender" })
    .optional(),
});

// Update user credentials validation schema (sensitive data)
export const updateUserCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be 50 characters or fewer" })
    .optional(),
  email: z
    .string()
    .email({ message: "Please provide a valid email address" })
    .max(100, { message: "Email must be 100 characters or fewer" })
    .optional(),
});

// Parameter schema for user operations
export const userParamsSchema = z.object({
  userId: z.coerce
    .number()
    .int()
    .positive({ message: "User ID must be a positive integer" }),
});

// Username availability check schema
export const checkUsernameSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be 50 characters or fewer" }),
});
