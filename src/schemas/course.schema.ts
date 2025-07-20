import { z } from "zod";

// Create course validation schema
export const createCourseSchema = z.object({
  provider: z
    .string()
    .max(100, { message: "Provider must be 100 characters or fewer" }),
  courseName: z
    .string()
    .max(200, { message: "Course name must be 200 characters or fewer" })
    .optional(),
  startDate: z.coerce
    .date({ invalid_type_error: "Invalid start date format" })
    .optional(),
  endDate: z.coerce
    .date({ invalid_type_error: "Invalid end date format" })
    .optional(),
  descriptions: z.array(z.string()).optional(),
});

// Update course validation schema
export const updateCourseSchema = createCourseSchema.partial();

// Parameters schema for CV ID and Course ID
export const courseParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  courseId: z.coerce
    .number()
    .int()
    .positive({ message: "Course ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all courses)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
