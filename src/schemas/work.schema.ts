import { z } from "zod";

// Create work validation schema
export const createWorkSchema = z.object({
  company: z
    .string()
    .max(100, { message: "Company name must be 100 characters or fewer" }),
  position: z
    .string()
    .max(100, { message: "Position must be 100 characters or fewer" }),
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
  isCurrent: z.boolean().optional(),
  descriptions: z.array(z.string()).optional(),
  location: z
    .string()
    .max(100, { message: "Location must be 100 characters or fewer" })
    .optional(),
});

// Update work validation schema
export const updateWorkSchema = createWorkSchema.partial();

// Parameters schema for CV ID and Work ID
export const workParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  workId: z.coerce
    .number()
    .int()
    .positive({ message: "Work ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all works)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
