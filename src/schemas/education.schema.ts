import { z } from "zod";

const idSchema = z.number().int().positive();

export const educationSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
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
  id: true,
  cvId: true,
});

export const educationUpdateSchema = educationInsertSchema.partial();

export const educationQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["institution", "degree", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export type EducationSelect = z.infer<typeof educationSelectSchema>;
export type EducationInsert = z.infer<typeof educationInsertSchema>;
export type EducationUpdate = z.infer<typeof educationUpdateSchema>;
export type EducationQueryOptions = z.infer<typeof educationQueryOptionsSchema>;
