import { z } from "zod";

const idSchema = z.number().int().positive();

export const educationSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  institution: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  degree: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  fieldOfStudy: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid date format" }),
  gpa: z
    .union([z.string(), z.null()])
    .refine((val) => val === null || /^\d{1,1}(\.\d{1,2})?$/.test(val), {
      message: "GPA must be a decimal with up to 2 decimal places",
    }),
  url: z.string().url({ message: "Invalid URL format" }),
});

export const educationInsertSchema = educationSelectSchema.omit({
  personalId: true,
  id: true,
});
export const educationUpdateSchema = educationInsertSchema.partial().extend({
  id: idSchema,
});

// Inferred types
export type EducationSelect = z.infer<typeof educationSelectSchema>;
export type EducationInsert = z.infer<typeof educationInsertSchema>;
export type EducationUpdate = z.infer<typeof educationUpdateSchema>;
