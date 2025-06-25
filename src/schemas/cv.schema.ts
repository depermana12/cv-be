import { z } from "zod";

const idSchema = z.number().int().positive({ message: "Invalid ID" });

export const cvSelectSchema = z.object({
  id: idSchema,
  userId: idSchema,
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(255, { message: "Title must be 255 characters or fewer" }),
  description: z
    .string({ required_error: "Description is required" })
    .max(1000, { message: "Description must be 1000 characters or fewer" }),
  theme: z
    .string()
    .max(100, { message: "Theme must be 100 characters or fewer" }),
  isPublic: z.boolean({
    required_error: "Visibility status (isPublic) is required",
  }),
  slug: z.string().max(255).nullable().default(null),
  views: z
    .number()
    .int({ message: "Views must be an integer" })
    .nonnegative({ message: "Views cannot be negative" }),
  downloads: z
    .number()
    .int({ message: "Downloads must be an integer" })
    .nonnegative({ message: "Downloads cannot be negative" }),
  language: z
    .string({ required_error: "Language is required" })
    .length(2, {
      message: "Language must be a 2-letter ISO code (e.g., 'en', 'id')",
    })
    .or(z.literal("id")),
  createdAt: z.coerce.date({ message: "Invalid creation date" }),
  updatedAt: z.coerce.date({ message: "Invalid update date" }),
});

export const cvApiResponseSchema = cvSelectSchema.extend({
  createdAt: z.date().transform((d) => d.toISOString()),
  updatedAt: z.date().transform((d) => d.toISOString()),
});

export const cvInsertSchema = cvSelectSchema
  .omit({
    id: true,
    userId: true,
    views: true,
    downloads: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().min(3, {
      message: "Title is required and must be at least 3 characters",
    }),
    isPublic: z.boolean().default(false),
    language: z.string().length(2).or(z.literal("id")).default("id"),
  });

export const cvUpdateSchema = cvInsertSchema.extend({ id: idSchema }).partial();

export const cvQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["title", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
  limit: z.coerce.number().min(1).default(10).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

export const paginatedCvResponseSchema = z.object({
  data: z.array(cvSelectSchema),
  total: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type CvSelect = z.infer<typeof cvSelectSchema>;
export type CvInsert = z.infer<typeof cvInsertSchema>;
export type CvUpdate = z.infer<typeof cvUpdateSchema>;

export type CvQueryOptions = z.infer<typeof cvQueryOptionsSchema>;
export type PaginatedCvResponse = z.infer<typeof paginatedCvResponseSchema>;
