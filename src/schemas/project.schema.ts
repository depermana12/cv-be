import { z } from "zod";

const idSchema = z.number().int().positive();

export const projectSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  description: z
    .string()
    .max(500, { message: "Must be 500 characters or fewer" }),
  url: z.string().url({ message: "Invalid URL format" }).optional(),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }).optional(),
});

export const projectInsertSchema = projectSelectSchema.omit({
  id: true,
  cvId: true,
});

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

export const projectDescUpdateSchema = projectDescInsertSchema.partial();

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

export const projectTechUpdateSchema = projectTechInsertSchema.partial();

export const projectQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["name", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const projectInsertWithDescSchema = projectInsertSchema.extend({
  descriptions: z.array(projectDescInsertSchema).optional(),
});

export const projectInsertWithDescAndTechSchema = projectInsertSchema.extend({
  descriptions: z.array(projectDescInsertSchema).optional(),
  technologies: z.array(projectTechInsertSchema).optional(),
});

export const projectUpdateWithDescAndTechSchema = z.object({
  project: projectUpdateSchema.optional(),
  descriptions: z.array(projectDescInsertSchema).optional(),
  technologies: z.array(projectTechInsertSchema).optional(),
});

export const projectTechQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["category", "technology"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Type exports
export type ProjectSelect = z.infer<typeof projectSelectSchema>;
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectDescSelect = z.infer<typeof projectDescSelectSchema>;
export type ProjectDescInsert = z.infer<typeof projectDescInsertSchema>;
export type ProjectDescUpdate = z.infer<typeof projectDescUpdateSchema>;
export type ProjectTechSelect = z.infer<typeof projectTechSelectSchema>;
export type ProjectTechInsert = z.infer<typeof projectTechInsertSchema>;
export type ProjectTechUpdate = z.infer<typeof projectTechUpdateSchema>;
export type ProjectQueryOptions = z.infer<typeof projectQueryOptionsSchema>;
export type ProjectTechQueryOptions = z.infer<
  typeof projectTechQueryOptionsSchema
>;
export type ProjectInsertWithDesc = z.infer<typeof projectInsertWithDescSchema>;
export type ProjectInsertWithDescAndTech = z.infer<
  typeof projectInsertWithDescAndTechSchema
>;
export type ProjectUpdateWithDescAndTech = z.infer<
  typeof projectUpdateWithDescAndTechSchema
>;
