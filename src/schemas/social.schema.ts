import { z } from "zod";

const idSchema = z.number().int().positive();

export const socialSelectSchema = z.object({
  id: idSchema,
  personalId: z.number().int(),
  social: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  username: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  url: z.string().url({ message: "Invalid url" }).max(255),
});

export const socialInsertSchema = socialSelectSchema.omit({
  id: true,
  personalId: true,
});

export const socialUpdateSchema = socialInsertSchema
  .extend({ id: idSchema })
  .partial();

export type SocialSelect = z.infer<typeof socialSelectSchema>;
export type SocialCreate = z.infer<typeof socialInsertSchema>;
export type SocialUpdate = z.infer<typeof socialUpdateSchema>;
