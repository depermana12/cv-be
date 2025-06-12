import { z } from "zod";

const idSchema = z.number().int().positive();

export const orgSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  organization: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  role: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
});

export const orgInsertSchema = orgSelectSchema.omit({
  id: true,
  cvId: true,
});

export const orgUpdateSchema = orgInsertSchema.partial();

export type OrgSelect = z.infer<typeof orgSelectSchema>;
export type OrgInsert = z.infer<typeof orgInsertSchema>;
export type OrgUpdate = z.infer<typeof orgUpdateSchema>;

export const orgDescSelectSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  description: z.string(),
});

export const orgDescInsertSchema = orgDescSelectSchema.omit({
  id: true,
  organizationId: true,
});

export const orgDescUpdateSchema = orgDescInsertSchema.partial();

export const orgQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["organization", "role", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type OrgDescSelect = z.infer<typeof orgDescSelectSchema>;
export type OrgDescInsert = z.infer<typeof orgDescInsertSchema>;
export type OrgDescUpdate = z.infer<typeof orgDescUpdateSchema>;

export const orgInsertWithDescSchema = orgInsertSchema.extend({
  descriptions: z.array(orgDescInsertSchema).optional(),
});

export type OrgInsertWithDesc = z.infer<typeof orgInsertWithDescSchema>;
export type OrgQueryOptions = z.infer<typeof orgQueryOptionsSchema>;
