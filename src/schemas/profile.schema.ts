import { z } from "zod";

const idSchema = z.number().int().positive();

export const profileSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  firstName: z
    .string()
    .min(3, { message: "First name is required" })
    .max(100, { message: "Must be 100 characters or fewer" }),
  lastName: z
    .string()
    .min(3, { message: "Last name is required" })
    .max(100, { message: "Must be 100 characters or fewer" }),
  bio: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  image: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  summary: z.string({ message: "summary needed" }),
  phone: z.string().regex(/^(\+\d{1,3}|0)[1-9]\d{4,14}$/, {
    message: "Must start with '+' followed by country code or '0'",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  url: z.string().url({ message: "Invalid url" }),
});

export const profileInsertSchema = profileSelectSchema.omit({
  id: true,
  cvId: true,
});

export const profileUpdateSchema = profileInsertSchema.partial();

export const profileQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["firstName", "lastName"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type ProfileSelect = z.infer<typeof profileSelectSchema>;
export type ProfileInsert = z.infer<typeof profileInsertSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ProfileQueryOptions = z.infer<typeof profileQueryOptionsSchema>;
