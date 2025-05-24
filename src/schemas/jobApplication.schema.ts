import { z } from "zod";

const idSchema = z.number().int().positive();

export const jobApplicationSelectSchema = z.object({
  id: idSchema,
  userId: idSchema,
  cvId: idSchema.nullable(),
  jobPortal: z
    .string()
    .max(100, { message: "Job portal must be 100 characters or less" })
    .optional()
    .nullable(),
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
  position: z
    .string()
    .max(255, { message: "Position must be 255 characters or less" }),
  location: z
    .string()
    .max(255, { message: "Location must be 255 characters or less" })
    .optional()
    .nullable(),
  status: z
    .enum(
      ["applied", "interview", "offer", "rejected", "accepted", "ghosted"],
      { message: "Invalid status" },
    )
    .default("applied"),
  notes: z.string().optional().nullable(),
  appliedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const jobApplicationInsertSchema = jobApplicationSelectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const jobApplicationUpdateSchema = jobApplicationInsertSchema.partial();

export type JobApplicationSelectSchema = z.infer<
  typeof jobApplicationSelectSchema
>;
export type JobApplicationInsertSchema = z.infer<
  typeof jobApplicationInsertSchema
>;
export type JobApplicationUpdateSchema = z.infer<
  typeof jobApplicationUpdateSchema
>;
