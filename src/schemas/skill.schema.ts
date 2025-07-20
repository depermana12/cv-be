import { z } from "zod";

// Create skill validation schema
export const createSkillSchema = z.object({
  type: z.enum(["technical", "soft", "language", "tool"], {
    message: "Please select a valid skill type",
  }),
  category: z
    .string()
    .max(100, { message: "Category must be 100 characters or fewer" }),
  name: z
    .string()
    .max(100, { message: "Skill name must be 100 characters or fewer" }),
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"], {
      message: "Please select a valid proficiency level",
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  description: z.string().optional(),
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
