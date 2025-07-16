import { z } from "zod";

const idSchema = z.number().int().positive();

export const jobApplicationSelectSchema = z.object({
  id: idSchema,
  userId: idSchema,
  cvId: idSchema.nullable(),
  jobPortal: z
    .string()
    .max(100, { message: "Job portal must be 100 characters or less" }),
  jobUrl: z
    .string()
    .max(255, { message: "Job URL must be 255 characters or less" })
    // .optional()
    .nullable(),
  companyName: z
    .string()
    .min(8, { message: "Company name must be at least 8 characters" })
    .max(255, { message: "Company name must be 255 characters or less" }),
  jobTitle: z
    .string()
    .min(8, { message: "Job title must be at least 8 charachters" })
    .max(255, { message: "Job title must be 255 characters or less" }),
  jobType: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
    "Volunteer",
  ]),
  position: z.enum([
    "Manager",
    "Lead",
    "Senior",
    "Mid-level",
    "Junior",
    "Intern",
    "Entry-level",
    "Staff",
    "Other",
  ]),
  location: z.string().max(255, {
    message: "Location must be 255 characters or less",
  }),
  locationType: z.enum(["Remote", "On-site", "Hybrid"]),
  status: z
    .enum(
      ["applied", "interview", "offer", "rejected", "accepted", "ghosted"],
      { message: "Invalid status" },
    )
    .default("applied"),
  notes: z.string().nullable(),
  appliedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const jobApplicationCreateSchema = jobApplicationSelectSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const jobApplicationUpdateSchema = jobApplicationCreateSchema
  .partial()
  .extend({ statusChangedAt: z.coerce.date().optional() });

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n > 0, {
      message: "ID must be a positive number",
    }),
});

export const jobApplicationQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["position", "companyName", "status", "appliedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
  appliedAtFrom: z.coerce.date().optional(),
  appliedAtTo: z.coerce.date().optional(),
});

export type JobApplicationSelect = z.infer<typeof jobApplicationSelectSchema>;
export type JobApplicationCreate = z.infer<typeof jobApplicationCreateSchema>;
export type JobApplicationUpdate = z.infer<typeof jobApplicationUpdateSchema>;
export type JobApplicationQueryOptions = z.infer<
  typeof jobApplicationQueryOptionsSchema
>;

export type JobApplicationQueryResponse = {
  data: JobApplicationSelect[];
  total: number;
  limit: number;
  offset: number;
};
