import { z } from "zod";

const idSchema = z.number().int().positive();

export const organizationBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  organization: z
    .string()
    .max(100, { message: "Must be 100 characters or fewer" }),
  role: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  startDate: z.coerce.date({ invalid_type_error: "Invalid start date" }),
  endDate: z.coerce.date({ invalid_type_error: "Invalid end date" }),
});

export const organizationCreateSchema = organizationBaseSchema.omit({
  id: true,
  personalId: true,
});

export const organizationUpdateSchema = organizationCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type OrganizationType = z.infer<typeof organizationBaseSchema>;
export type OrganizationCreateType = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateType = z.infer<typeof organizationUpdateSchema>;

export const organizationDetailBaseSchema = z.object({
  id: idSchema,
  organizationExperienceId: idSchema,
  description: z.string(),
});

export const organizationDetailCreateSchema = organizationDetailBaseSchema.omit(
  { id: true, organizationExperienceId: true },
);

export const organizationDetailUpdateSchema = organizationDetailCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type OrganizationDetail = z.infer<typeof organizationDetailBaseSchema>;
export type OrganizationDetailCreate = z.infer<
  typeof organizationDetailCreateSchema
>;
export type OrganizationDetailUpdate = z.infer<
  typeof organizationDetailUpdateSchema
>;
