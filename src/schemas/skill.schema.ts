import { z } from "zod";

// Create skill validation schema
export const createSkillSchema = z.object({
  category: z
    .string()
    .max(255, { message: "Category must be 255 characters or fewer" }),
  skill: z
    .array(z.string())
    .min(1, { message: "At least one skill is required" }),
});

// Update skill validation schema
export const updateSkillSchema = createSkillSchema.partial();

// Parameters schema for CV ID and Skill ID
export const skillParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  skillId: z.coerce
    .number()
    .int()
    .positive({ message: "Skill ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all skills)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
