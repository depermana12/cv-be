import { z } from "zod";

const idSchema = z.number().int().positive();
export const courseBaseSchema = z.object({
  provider: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  courseName: z
    .string()
    .max(200, { message: "Must be 200 characters or fewer" }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export const courseResponseSchema = courseBaseSchema.extend({
  id: idSchema,
  cvId: idSchema,
});

export const courseDescResponseSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  description: z.string(),
});

// API operation schemas
export const courseDescInsertSchema = courseDescResponseSchema.omit({
  id: true,
  courseId: true,
});
export const courseDescUpdateSchema = courseDescInsertSchema.partial();

export const courseCreateSchema = courseBaseSchema.extend({
  descriptions: z.array(courseDescInsertSchema).optional().default([]),
});

export const courseUpdateSchema = courseBaseSchema.partial().extend({
  descriptions: z.array(courseDescUpdateSchema).optional(),
});

export const courseQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["courseName", "provider", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});
