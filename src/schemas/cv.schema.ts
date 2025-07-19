import { z } from "zod";

// Insert validation schemas
export const createCvSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(255, { message: "Title must be 255 characters or fewer" }),
  description: z
    .string({ required_error: "Description is required" })
    .max(1000, { message: "Description must be 1000 characters or fewer" }),
  theme: z
    .string()
    .max(100, { message: "Theme must be 100 characters or fewer" })
    .default("default"),
  isPublic: z.boolean().default(false),
  slug: z
    .string()
    .max(255, { message: "Slug must be 255 characters or fewer" })
    .nullable()
    .optional(),
  language: z
    .string()
    .length(2, {
      message: "Language must be a 2-letter ISO code (e.g., 'en', 'id')",
    })
    .default("id"),
});

// update validation schema
export const updateCvSchema = createCvSchema.partial();

// query parameters schema
export const cvQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "views", "downloads"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
  isPublic: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// parameters schema for CV ID
export const cvParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
