import { z } from "zod";

const idSchema = z.number().int().positive();

export const languageSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  language: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  fluency: z.string().max(25, { message: "Must be 25 characters or fewer" }),
});

export const languageInsertSchema = languageSelectSchema.omit({
  id: true,
  cvId: true,
});

export const languageQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["language", "fluency"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export const languageUpdateSchema = languageInsertSchema.partial();

export type LanguageSelect = z.infer<typeof languageSelectSchema>;
export type LanguageInsert = z.infer<typeof languageInsertSchema>;
export type LanguageUpdate = z.infer<typeof languageUpdateSchema>;
export type LanguageQueryOptions = z.infer<typeof languageQueryOptionsSchema>;
