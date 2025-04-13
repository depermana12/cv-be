import { z } from "zod";

const idSchema = z.number().int().positive();

export const workBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  company: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  position: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
  isCurrent: z.boolean(),
});

export const workCreateSchema = workBaseSchema.omit({
  id: true,
});

export const workUpdateSchema = workCreateSchema.partial().extend({
  id: idSchema,
});

export type WorkBase = z.infer<typeof workBaseSchema>;
export type WorkCreate = z.infer<typeof workCreateSchema>;
export type WorkUpdate = z.infer<typeof workUpdateSchema>;

export const workDetailsBaseSchema = z.object({
  id: idSchema,
  workExperienceId: idSchema,
  description: z.string(),
});

export const workDetailsCreateSchema = workDetailsBaseSchema.omit({ id: true });

export const workDetailsUpdateSchema = workDetailsCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type WorkDetailsBase = z.infer<typeof workDetailsBaseSchema>;
export type WorkDetailsCreate = z.infer<typeof workDetailsCreateSchema>;
export type WorkDetailsUpdate = z.infer<typeof workDetailsUpdateSchema>;
