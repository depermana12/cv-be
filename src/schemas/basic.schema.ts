import { z } from "zod";

const idSchema = z.number().int().positive();

export const basicSelectSchema = z.object({
  id: idSchema,
  fullName: z
    .string()
    .min(3, { message: "Must be 3 or more characters long" })
    .max(100),
  bio: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  image: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  summary: z.string(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email({ message: "Invalid email address" }),
  url: z.string().url({ message: "Invalid url" }),
  createdAt: z.string().datetime(),
});

export const basicInsertSchema = basicSelectSchema.omit({
  id: true,
  createdAt: true,
});

export const basicUpdateSchema = basicInsertSchema
  .extend({ id: idSchema })
  .partial();

export type BasicSelect = z.infer<typeof basicSelectSchema>;
export type BasicInsert = z.infer<typeof basicInsertSchema>;
export type BasicUpdate = z.infer<typeof basicUpdateSchema>;
