import { z } from "zod";

const idSchema = z.number().int().positive();

export const projectSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
});

export const projectInsertSchema = projectSelectSchema.omit({
  id: true,
  personalId: true,
});

export const projectUpdateSchema = projectInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

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

export const projectDescUpdateSchema = projectDescInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

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

export const projectTechUpdateSchema = projectTechInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type ProjectTechSelect = z.infer<typeof projectTechSelectSchema>;
export type ProjectTechInsert = z.infer<typeof projectTechInsertSchema>;
export type ProjectTechUpdate = z.infer<typeof projectTechUpdateSchema>;
