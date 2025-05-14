import { z } from "zod";

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
  createdAt: z.date().optional(),
});

export const userInsertSchema = userSchema.omit({
  id: true,
  createdAt: true,
});
export const userUpdateSchema = userSchema.partial().omit({ id: true });

export const userLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const userInputEmail = z.object({
  email: z.string().email({ message: "You will receive an email" }),
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
