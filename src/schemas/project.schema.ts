import { z } from "zod";

// Create project validation schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .max(100, { message: "Project name must be 100 characters or fewer" }),
  startDate: z.coerce
    .date({ invalid_type_error: "Invalid start date format" })
    .optional(),
  endDate: z.coerce
    .date({ invalid_type_error: "Invalid end date format" })
    .optional(),
  url: z
    .string()
    .url({ message: "Please provide a valid URL" })
    .max(255, { message: "URL must be 255 characters or fewer" })
    .optional(),
  descriptions: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

// Update project validation schema
export const updateProjectSchema = createProjectSchema.partial();

// Parameters schema for CV ID and Project ID
export const projectParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  projectId: z.coerce
    .number()
    .int()
    .positive({ message: "Project ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all projects)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
