import { z } from "zod";

const idSchema = z.number().int().positive();

export const workSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  company: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  position: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
  isCurrent: z.boolean(),
});

export const workInsertSchema = workSelectSchema.omit({
  id: true,
  cvId: true,
});

export const workUpdateSchema = workInsertSchema.partial();

export type WorkSelect = z.infer<typeof workSelectSchema>;
export type WorkInsert = z.infer<typeof workInsertSchema>;
export type WorkUpdate = z.infer<typeof workUpdateSchema>;

export const workDescSelectSchema = z.object({
  id: idSchema,
  workId: idSchema,
  description: z.string(),
});

export const workDescInsertSchema = workDescSelectSchema.omit({
  id: true,
  workId: true,
});

export const workDescUpdateSchema = workDescInsertSchema.partial();

export type WorkDescSelect = z.infer<typeof workDescSelectSchema>;
export type WorkDescInsert = z.infer<typeof workDescInsertSchema>;
export type WorkDescUpdate = z.infer<typeof workDescUpdateSchema>;

export const workInsertWithDescSchema = workInsertSchema.extend({
  descriptions: z.array(workDescInsertSchema).optional(),
});

export type WorkInsertWithDesc = z.infer<typeof workInsertWithDescSchema>;
