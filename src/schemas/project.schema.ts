import { z } from "zod";

const idSchema = z.number().int().positive();

export const projectBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
});

export const projectCreateSchema = projectBaseSchema.omit({ id: true });

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: idSchema,
});

export type Project = z.infer<typeof projectBaseSchema>;
export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const projectDetailBaseSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  description: z.string(),
});

export const projectDetailCreateSchema = projectDetailBaseSchema.omit({
  id: true,
});

export const projectDetailUpdateSchema = projectDetailCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type ProjectDetail = z.infer<typeof projectDetailBaseSchema>;
export type ProjectDetailCreate = z.infer<typeof projectDetailCreateSchema>;
export type ProjectDetailUpdate = z.infer<typeof projectDetailUpdateSchema>;

export const projectTechnologyBaseSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  technology: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  category: z.string().max(100, { message: "Must be 100 characters or fewer" }),
});

export const projectTechnologyCreateSchema = projectTechnologyBaseSchema.omit({
  id: true,
});

export const projectTechnologyUpdateSchema = projectTechnologyCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type ProjectTechnology = z.infer<typeof projectTechnologyBaseSchema>;
export type ProjectTechnologyCreate = z.infer<
  typeof projectTechnologyCreateSchema
>;
export type ProjectTechnologyUpdate = z.infer<
  typeof projectTechnologyUpdateSchema
>;
