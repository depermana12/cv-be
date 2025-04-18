import { z } from "zod";

const idSchema = z.number().int().positive();

export const skillBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  category: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
});

export const skillCreateSchema = skillBaseSchema.omit({
  id: true,
  personalId: true,
});

export const skillUpdateSchema = skillCreateSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type Skill = z.infer<typeof skillBaseSchema>;
export type SkillCreate = z.infer<typeof skillCreateSchema>;
export type SkillUpdate = z.infer<typeof skillUpdateSchema>;
