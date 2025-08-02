import { z } from "zod";

// Create education validation schema
export const createEducationSchema = z.object({
  institution: z
    .string()
    .max(100, { message: "Institution must be 100 characters or fewer" }),
  degree: z.enum(
    ["high_school", "diploma", "bachelor", "master", "doctorate"],
    {
      message: "Please select a valid degree type",
    },
  ),
  fieldOfStudy: z
    .string()
    .max(100, { message: "Field of study must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date format" }),
  endDate: z.coerce
    .date({ invalid_type_error: "Invalid end date format" })
    .optional(),
  gpa: z
    .string()
    .regex(/^\d{1,1}(\.\d{1,2})?$/, {
      message: "GPA must be a decimal with up to 2 decimal places",
    })
    .optional(),
  location: z
    .string()
    .max(100, { message: "Location must be 100 characters or fewer" }),
  description: z.string().optional(),
});

// Update education validation schema
export const updateEducationSchema = createEducationSchema.partial();

// Parameters schema for CV ID and Education ID
export const educationParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  educationId: z.coerce
    .number()
    .int()
    .positive({ message: "Education ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all educations)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
