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
  about: z
    .string()
    .max(1000, { message: "About section must be 1000 characters or fewer" })
    .optional(),
  bio: z
    .string()
    .max(255, { message: "Bio must be 255 characters or fewer" })
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

// Update user preferences validation schema
export const updateUserPreferencesSchema = z.object({
  emailNotifications: z
    .boolean({ message: "Email notifications must be true or false" })
    .optional(),
  monthlyReports: z
    .boolean({ message: "Monthly reports must be true or false" })
    .optional(),
});

// Update user subscription validation schema
export const updateUserSubscriptionSchema = z.object({
  subscriptionType: z
    .enum(["free", "trial", "pro"], {
      message: "Please select a valid subscription type",
    })
    .optional(),
  subscriptionStatus: z
    .enum(["active", "expired", "cancelled", "pending"], {
      message: "Please select a valid subscription status",
    })
    .optional(),
  subscriptionExpiresAt: z.coerce
    .date({ invalid_type_error: "Invalid subscription expiry date format" })
    .optional(),
});

// Parameter schema for user operations
export const userParamsSchema = z.object({
  userId: z.coerce
    .number()
    .int()
    .positive({ message: "User ID must be a positive integer" }),
});

// Delete user validation schema
export const deleteUserSchema = z.object({
  password: z.string({ required_error: "Password is required" }),
});

// Monthly goal validation schema
export const updateMonthlyGoalSchema = z.object({
  goal: z.coerce
    .number()
    .int()
    .positive({ message: "Monthly goal must be a positive integer" })
    .min(1, { message: "Monthly goal must be at least 1" })
    .max(1000, { message: "Monthly goal cannot exceed 1000" }),
});
