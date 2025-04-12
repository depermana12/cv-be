import { z } from "zod";

const idSchema = z.number().int().positive();

export const languageBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  language: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  fluency: z.string().max(25, { message: "Must be 25 characters or fewer" }),
});

export const languageCreateSchema = languageBaseSchema.omit({ id: true });
export const languageUpdateSchema = languageCreateSchema
  .partial()
  .extend({ id: idSchema });

export type LanguageBase = z.infer<typeof languageBaseSchema>;
export type LanguageCreate = z.infer<typeof languageCreateSchema>;
export type LanguageUpdate = z.infer<typeof languageUpdateSchema>;
