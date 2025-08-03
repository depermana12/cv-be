import { z } from "zod";

// User registration validation schema
export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must be 50 characters or fewer" })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      }),
    email: z
      .string()
      .email({ message: "Please provide a valid email address" })
      .max(100, { message: "Email must be 100 characters or fewer" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password must be 128 characters or fewer" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
        },
      ),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

// User login validation schema
export const signinSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be 128 characters or fewer" }),
});

// Forgot password validation schema
export const forgetPasswordSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address" }),
});

// Reset password validation schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(128, { message: "Password must be 128 characters or fewer" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)",
        },
      ),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

// Parameter schemas for token validation
export const tokenParamsSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});

// Parameter schema for user ID (for email verification status)
export const userIdParamsSchema = z.object({
  userId: z.coerce
    .number()
    .int()
    .positive({ message: "User ID must be a positive integer" }),
});

// Username check parameter schema
export const usernameQuerySchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be 50 characters or fewer" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Username can only contain letters, numbers, underscores, and hyphens",
    }),
});
