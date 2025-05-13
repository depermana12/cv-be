import { z } from "zod";

const idSchema = z.number().int().positive();

export const workSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  company: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  position: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
  url: z.string().url({ message: "Invalid URL format" }),
  isCurrent: z.boolean(),
});

export const workInsertSchema = workSelectSchema.omit({
  id: true,
  personalId: true,
});

export const workUpdateSchema = workInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type WorkSelect = z.infer<typeof workSelectSchema>;
export type WorkInsert = z.infer<typeof workInsertSchema>;
export type WorkUpdate = z.infer<typeof workUpdateSchema>;

export const workDescSelectSchema = z.object({
  id: idSchema,
  workExperienceId: idSchema,
  description: z.string(),
});

export const workDescInsertSchema = workDescSelectSchema.omit({
  id: true,
  workExperienceId: true,
});

export const workDescUpdateSchema = workDescInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

export const workInsertWithDescriptionsSchema = workInsertSchema.extend({
  descriptions: z.array(workDescInsertSchema).optional(),
});

export type WorkDescSelect = z.infer<typeof workDescSelectSchema>;
export type WorkDescInsert = z.infer<typeof workDescInsertSchema>;
export type WorkDescUpdate = z.infer<typeof workDescUpdateSchema>;

export type WorkInsertWithDescriptions = z.infer<
  typeof workInsertWithDescriptionsSchema
>;
