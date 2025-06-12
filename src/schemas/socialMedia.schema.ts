import { z } from "zod";

const idSchema = z.number().int().positive();

export const socialMediaSelectSchema = z.object({
  id: idSchema,
  cvId: z.number().int(),
  social: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  username: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  url: z.string().url({ message: "Invalid url" }).max(255),
});

export const socialMediaInsertSchema = socialMediaSelectSchema.omit({
  id: true,
  cvId: true,
});

export const socialMediaUpdateSchema = socialMediaInsertSchema.partial();

export const socialMediaQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["social"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type SocialMediaSelect = z.infer<typeof socialMediaSelectSchema>;
export type SocialMediaCreate = z.infer<typeof socialMediaInsertSchema>;
export type SocialMediaUpdate = z.infer<typeof socialMediaUpdateSchema>;
export type SocialMediaQueryOptions = z.infer<
  typeof socialMediaQueryOptionsSchema
>;
