import { z } from "zod";

const idSchema = z.number().int().positive();

export const organizationSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  organization: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  role: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
});

export const organizationInsertSchema = organizationSelectSchema.omit({
  id: true,
  personalId: true,
});

export const organizationUpdateSchema = organizationInsertSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type OrganizationSelect = z.infer<typeof organizationSelectSchema>;
export type OrganizationInsert = z.infer<typeof organizationInsertSchema>;
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>;

export const organizationDescSelectSchema = z.object({
  id: idSchema,
  organizationExperienceId: idSchema,
  description: z.string(),
});

export const organizationDescInsertSchema = organizationDescSelectSchema.omit({
  id: true,
  organizationExperienceId: true,
});

export const organizationDescUpdateSchema = organizationDescInsertSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type OrganizationDescSelect = z.infer<
  typeof organizationDescSelectSchema
>;
export type OrganizationDescInsert = z.infer<
  typeof organizationDescInsertSchema
>;
export type OrganizationDescUpdate = z.infer<
  typeof organizationDescUpdateSchema
>;
