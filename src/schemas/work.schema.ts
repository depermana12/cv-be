import { z } from "zod";

const idSchema = z.number().int().positive();

export const workBaseSchema = z.object({
  company: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  position: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }).optional(),
  url: z.string().url({ message: "Invalid URL format" }).optional(),
  isCurrent: z.boolean().optional().default(false),
});

export const workResponseSchema = workBaseSchema.extend({
  id: idSchema,
  cvId: idSchema,
});

export const workDescResponseSchema = z.object({
  id: idSchema,
  workId: idSchema,
  description: z.string(),
});

// API operation schemas
export const workDescCreateSchema = workDescResponseSchema.omit({
  id: true,
  workId: true,
});
export const workDescUpdateSchema = workDescCreateSchema.partial();
export const workCreateSchema = workBaseSchema.extend({
  descriptions: z.array(workDescCreateSchema).optional().default([]),
});
export const workUpdateSchema = workBaseSchema.partial().extend({
  descriptions: z.array(workDescCreateSchema).optional(),
});
export const workQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["company", "position", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
