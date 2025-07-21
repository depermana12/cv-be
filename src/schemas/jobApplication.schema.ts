import { z } from "zod";

// Create job application validation schema
export const createJobApplicationSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" })
    .optional()
    .nullable(),
  jobPortal: z
    .string()
    .max(100, { message: "Job portal must be 100 characters or fewer" }),
  jobUrl: z
    .string()
    .max(255, { message: "Job URL must be 255 characters or fewer" })
    .optional(),
  companyName: z
    .string()
    .min(1, { message: "Company name is required" })
    .max(255, { message: "Company name must be 255 characters or fewer" }),
  jobTitle: z
    .string()
    .min(1, { message: "Job title is required" })
    .max(255, { message: "Job title must be 255 characters or fewer" }),
  jobType: z.enum(
    [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Freelance",
      "Volunteer",
    ],
    { message: "Please select a valid job type" },
  ),
  position: z.enum(
    [
      "Manager",
      "Lead",
      "Senior",
      "Mid-level",
      "Junior",
      "Intern",
      "Entry-level",
      "Staff",
      "Other",
    ],
    { message: "Please select a valid position level" },
  ),
  location: z
    .string()
    .max(255, { message: "Location must be 255 characters or fewer" })
    .optional(),
  locationType: z.enum(["Remote", "On-site", "Hybrid"], {
    message: "Please select a valid location type",
  }),
  status: z
    .enum(
      ["applied", "interview", "offer", "rejected", "accepted", "ghosted"],
      {
        message: "Please select a valid status",
      },
    )
    .default("applied"),
  notes: z.string().optional(),
  appliedAt: z.coerce.date({
    invalid_type_error: "Invalid applied date format",
  }),
});

// Update job application validation schema
export const updateJobApplicationSchema = createJobApplicationSchema
  .partial()
  .extend({ statusChangedAt: z.coerce.date().optional() });

// Parameters schema for Job Application ID only
export const jobApplicationParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: "Job Application ID must be a positive integer" }),
});

// Parameters schema for Job Application ID and Status ID
export const jobApplicationStatusParamsSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive({ message: "Job Application ID must be a positive integer" }),
  statusId: z.coerce
    .number()
    .int()
    .positive({ message: "Status ID must be a positive integer" }),
});

// Query options schema (keeping as requested)
export const jobApplicationQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["position", "companyName", "status", "appliedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  appliedAtFrom: z.coerce.date().optional(),
  appliedAtTo: z.coerce.date().optional(),
});
