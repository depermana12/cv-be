import { z } from "zod";

export const sectionImproveSchema = z.object({
  cvId: z
    .number({ required_error: "CV ID is required" })
    .int()
    .positive("CV ID must be a positive integer"),
  sectionType: z
    .string({ required_error: "Section type is required" })
    .min(1, "Section type cannot be empty")
    .max(50, "Section type must be 50 characters or fewer"),
  originalText: z
    .string({ required_error: "Original text is required" })
    .min(1, "Original text cannot be empty")
    .max(10000, "Original text must be 10000 characters or fewer"),
  targetRole: z
    .string()
    .max(255, "Target role must be 255 characters or fewer")
    .optional(),
  industry: z
    .string()
    .max(255, "Industry must be 255 characters or fewer")
    .optional(),
});

export const cvScoreSchema = z.object({
  cvId: z
    .number({ required_error: "CV ID is required" })
    .int()
    .positive("CV ID must be a positive integer"),
  fullText: z
    .string({ required_error: "Full text is required" })
    .min(1, "Full text cannot be empty")
    .max(50000, "Full text must be 50000 characters or fewer"),
  targetRole: z
    .string()
    .max(255, "Target role must be 255 characters or fewer")
    .optional(),
  industry: z
    .string()
    .max(255, "Industry must be 255 characters or fewer")
    .optional(),
});

export const cvIdParamsSchema = z.object({
  cvId: z.coerce.number().int().positive("CV ID must be a positive integer"),
});
