import { z } from "zod";

const idSchema = z.number().int().positive();

export const skillSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  category: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  name: z.string().max(100, { message: "Must be 100 characters or fewer" }),
});

export const skillInsertSchema = skillSelectSchema.omit({
  id: true,
  personalId: true,
});

export const skillUpdateSchema = skillInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type SkillSelect = z.infer<typeof skillSelectSchema>;
export type SkillInsert = z.infer<typeof skillInsertSchema>;
export type SkillUpdate = z.infer<typeof skillUpdateSchema>;
