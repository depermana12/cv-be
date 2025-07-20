import { z } from "zod";

// Create language validation schema
export const createLanguageSchema = z.object({
  language: z
    .string()
    .max(100, { message: "Language must be 100 characters or fewer" }),
  fluency: z
    .enum(["beginner", "intermediate", "advanced"], {
      message: "Please select a valid fluency level",
    })
    .optional(),
});

// Update language validation schema
export const updateLanguageSchema = createLanguageSchema.partial();

// Parameters schema for CV ID and Language ID
export const languageParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  languageId: z.coerce
    .number()
    .int()
    .positive({ message: "Language ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all languages)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
