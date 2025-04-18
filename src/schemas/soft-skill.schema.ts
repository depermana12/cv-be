import { z } from "zod";

const idSchema = z.number().int().positive();

export const softSkillBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  category: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  description: z.string(),
});

export const softSkillCreateSchema = softSkillBaseSchema.omit({
  id: true,
  personalId: true,
});

export const softSkillUpdateSchema = softSkillCreateSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type SoftSkill = z.infer<typeof softSkillBaseSchema>;
export type SoftSkillCreate = z.infer<typeof softSkillCreateSchema>;
export type SoftSkillUpdate = z.infer<typeof softSkillUpdateSchema>;
