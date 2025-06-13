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
    .optional()
    .nullable(),
  companyName: z
    .string()
    .max(255, { message: "Company name must be 255 characters or less" }),
  jobTitle: z
    .string()
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

  location: z.enum(["Remote", "On-site", "Hybrid"]).optional().nullable(),
  status: z
    .enum(
      ["applied", "interview", "offer", "rejected", "accepted", "ghosted"],
      { message: "Invalid status" },
    )
    .default("applied"),
  notes: z.string().optional().nullable(),
  appliedAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const jobApplicationCreateSchema = jobApplicationSelectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const jobApplicationUpdateSchema = jobApplicationCreateSchema.partial();

export const jobApplicationQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["position", "companyName", "status", "appliedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
