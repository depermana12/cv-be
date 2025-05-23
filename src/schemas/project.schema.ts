import { z } from "zod";

const idSchema = z.number().int().positive();

export const projectSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
});

export const projectInsertSchema = projectSelectSchema.omit({
  id: true,
  cvId: true,
});

export const projectUpdateSchema = projectInsertSchema.partial();

export type ProjectSelect = z.infer<typeof projectSelectSchema>;
export type ProjectInsert = z.infer<typeof projectInsertSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const projectDescSelectSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  description: z.string(),
});

export const projectDescInsertSchema = projectDescSelectSchema.omit({
  id: true,
  projectId: true,
});

export const projectDescUpdateSchema = projectDescInsertSchema.partial();

export type ProjectDescSelect = z.infer<typeof projectDescSelectSchema>;
export type ProjectDescInsert = z.infer<typeof projectDescInsertSchema>;
export type ProjectDescUpdate = z.infer<typeof projectDescUpdateSchema>;

export const projectTechSelectSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  technology: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  category: z.string().max(100, { message: "Must be 100 characters or fewer" }),
});

export const projectTechInsertSchema = projectTechSelectSchema.omit({
  id: true,
  projectId: true,
});

export const projectTechUpdateSchema = projectTechInsertSchema.partial();

export type ProjectTechSelect = z.infer<typeof projectTechSelectSchema>;
export type ProjectTechInsert = z.infer<typeof projectTechInsertSchema>;
export type ProjectTechUpdate = z.infer<typeof projectTechUpdateSchema>;

export const projectInsertWithDescSchema = projectInsertSchema.extend({
  descriptions: z.array(projectDescInsertSchema).optional(),
});

export const projectInsertWithTechSchema = projectInsertSchema.extend({
  technologies: z.array(projectTechInsertSchema).optional(),
});

export type ProjectInsertWithDesc = z.infer<typeof projectInsertWithDescSchema>;
export type ProjectInsertWithTech = z.infer<typeof projectInsertWithTechSchema>;
