import { z } from "zod";

const idSchema = z.number().int().positive();

export const organizationBaseSchema = z.object({
  organization: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  role: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }).optional(),
});

export const orgResponseSchema = organizationBaseSchema.extend({
  id: idSchema,
  cvId: idSchema,
});

export const orgDescResponseSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  description: z.string(),
});

// API operation schemas
export const orgDescCreateSchema = orgDescResponseSchema.omit({
  id: true,
  organizationId: true,
});
export const orgDescUpdateSchema = orgDescCreateSchema.partial();

export const orgCreateSchema = organizationBaseSchema.extend({
  descriptions: z.array(orgDescCreateSchema).optional().default([]),
});

export const orgUpdateSchema = organizationBaseSchema.partial().extend({
  descriptions: z.array(orgDescUpdateSchema).optional(),
});

export const orgQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["organization", "role", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
