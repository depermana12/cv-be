import { z } from "zod";

const idSchema = z.number().int().positive();

export const projectSelectSchema = z.object({
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  description: z.string().optional(),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }).optional(),
  url: z.string().url({ message: "Invalid URL format" }).optional(),
  descriptions: z
    .array(
      z.object({
        description: z.string().min(1),
      }),
    )
    .optional()
    .default([]),
  technologies: z
    .array(
      z.object({
        category: z.string().max(50),
        technology: z.string().max(100),
      }),
    )
    .optional()
    .default([]),
});

export const projectInsertSchema = projectSelectSchema;

export const projectUpdateSchema = projectInsertSchema.partial();

export const projectDescSelectSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  description: z.string().min(1, { message: "Description is required" }),
});
export const projectDescInsertSchema = projectDescSelectSchema.omit({
  id: true,
  projectId: true,
});

export const projectTechSelectSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  category: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  technology: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
});
export const projectTechInsertSchema = projectTechSelectSchema.omit({
  id: true,
  projectId: true,
});

export const projectFullInsertSchema = projectInsertSchema.extend({
  descriptions: z.array(projectDescInsertSchema).optional(),
  technologies: z.array(projectTechInsertSchema).optional(),
});

export const projectFullUpdateSchema = z.object({
  project: projectUpdateSchema.optional(),
  descriptions: z.array(projectDescInsertSchema).optional(),
  technologies: z.array(projectTechInsertSchema).optional(),
});

export const projectTechQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["category", "technology"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const projectQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Type exports
export type ProjectSelect = z.infer<typeof projectSelectSchema>;
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectDescSelect = z.infer<typeof projectDescSelectSchema>;
export type ProjectDescInsert = z.infer<typeof projectDescInsertSchema>;

export type ProjectQueryOptions = z.infer<typeof projectQueryOptionsSchema>;
export type ProjectTechQueryOptions = z.infer<
  typeof projectTechQueryOptionsSchema
>;
export type ProjectFullInsert = z.infer<typeof projectFullInsertSchema>;
export type ProjectFullUpdate = z.infer<typeof projectFullUpdateSchema>;
