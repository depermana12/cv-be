import { z } from "zod";

const idSchema = z.number().int().positive();

export const personalSelectSchema = z.object({
  id: idSchema,
  userId: idSchema,
  fullName: z
    .string()
    .min(3, { message: "Must be 3 or more characters long" })
    .max(100),
  bio: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  image: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  summary: z.string({ message: "summary needed" }),
  phone: z.string().regex(/^(\+\d{1,3}|0)[1-9]\d{4,14}$/, {
    message: "Must start with '+' followed by country code or '0'",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  url: z.string().url({ message: "Invalid url" }),
  createdAt: z.string().datetime(),
});

export const personalInsertSchema = personalSelectSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const personalUpdateSchema = personalInsertSchema
  .extend({ id: idSchema })
  .partial();

export type PersonalSelect = z.infer<typeof personalSelectSchema>;
export type PersonalInsert = z.infer<typeof personalInsertSchema>;
export type PersonalUpdate = z.infer<typeof personalUpdateSchema>;
