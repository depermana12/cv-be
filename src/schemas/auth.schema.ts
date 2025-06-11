import { z } from "zod";

export const userLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const emailForPasswordReset = z.object({
  email: z.string().email({ message: "Must be a valid email address" }),
});

export const userInputResetPassword = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password required minimal 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Confirm password is not the same as password",
        path: ["confirmPassword"],
      });
    }
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export type UserLogin = z.infer<typeof userLoginSchema>;
export type EmailForPasswordReset = z.infer<typeof emailForPasswordReset>;
export type UserInputResetPassword = z.infer<typeof userInputResetPassword>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
