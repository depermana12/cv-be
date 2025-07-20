import { z } from "zod";

// Create organization validation schema
export const createOrganizationSchema = z.object({
  organization: z
    .string()
    .max(100, { message: "Organization name must be 100 characters or fewer" }),
  role: z
    .string()
    .max(100, { message: "Role must be 100 characters or fewer" }),
  startDate: z.coerce
    .date({ invalid_type_error: "Invalid start date format" })
    .optional(),
  endDate: z.coerce
    .date({ invalid_type_error: "Invalid end date format" })
    .optional(),
  descriptions: z.array(z.string()).optional(),
  location: z
    .string()
    .max(100, { message: "Location must be 100 characters or fewer" })
    .optional(),
});

// Update organization validation schema
export const updateOrganizationSchema = createOrganizationSchema.partial();

// Parameters schema for CV ID and Organization ID
export const organizationParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  organizationId: z.coerce
    .number()
    .int()
    .positive({ message: "Organization ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get all organizations)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
