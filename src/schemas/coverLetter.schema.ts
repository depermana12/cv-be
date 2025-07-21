import { z } from "zod";

// Enums
export const toneEnum = z.enum([
  "professional",
  "friendly",
  "confident",
  "enthusiastic",
  "formal",
]);

// Cover Letter Template Schemas
export const coverLetterTemplateInsertSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1),
  tone: toneEnum.optional(),
  isDefault: z.boolean().optional(),
});

export const coverLetterTemplateUpdateSchema =
  coverLetterTemplateInsertSchema.partial();

export const coverLetterTemplateQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  tone: toneEnum.optional(),
  isDefault: z.boolean().optional(),
});

// Cover Letter Schemas
export const coverLetterInsertSchema = z.object({
  cvId: z.number().positive(),
  templateId: z.number().positive().optional(),
  applicationId: z.number().positive().optional(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  companyName: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  hiringManager: z.string().max(100).optional(),
  tone: toneEnum.optional(),
});

export const coverLetterUpdateSchema = coverLetterInsertSchema.partial().omit({
  cvId: true,
});

export const coverLetterQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  cvId: z.coerce.number().positive().optional(),
  tone: toneEnum.optional(),
  applicationId: z.coerce.number().positive().optional(),
});

// Cover Letter Section Schemas
export const coverLetterSectionInsertSchema = z.object({
  type: z.string().min(1).max(50),
  content: z.string().min(1),
  displayOrder: z.number().min(0),
});

export const coverLetterSectionUpdateSchema =
  coverLetterSectionInsertSchema.partial();

// Generate from template schema
export const generateFromTemplateSchema = z.object({
  templateId: z.number().positive(),
  cvId: z.number().positive(),
  companyName: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  hiringManager: z.string().max(100).optional(),
  applicationId: z.number().positive().optional(),
  customizations: z.record(z.string()).optional(), // For template placeholders
});
