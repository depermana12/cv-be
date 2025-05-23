import { z } from "zod";

const idSchema = z.number().int().positive();

export const softSkillSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  category: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  description: z.string(),
});

export const softSkillInsertSchema = softSkillSelectSchema.omit({
  id: true,
  cvId: true,
});

export const softSkillUpdateSchema = softSkillInsertSchema.partial();

export type SoftSkillSelect = z.infer<typeof softSkillSelectSchema>;
export type SoftSkillInsert = z.infer<typeof softSkillInsertSchema>;
export type SoftSkillUpdate = z.infer<typeof softSkillUpdateSchema>;
