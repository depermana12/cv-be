import { z } from "zod";

const idSchema = z.number().int().positive();

export const personalBasicBaseSchema = z.object({
  id: idSchema,
  fullName: z
    .string()
    .min(3, { message: "Must be 3 or more characters long" })
    .max(100),
  bio: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  image: z.string().max(255, { message: "Must be 255 characters or fewer" }),
  summary: z.string(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email({ message: "Invalid email address" }),
  url: z.string().url({ message: "Invalid url" }),
});

export const personalBasicCreateSchema = personalBasicBaseSchema.omit({
  id: true,
});
export const personalBasicUpdateSchema = personalBasicCreateSchema
  .partial()
  .extend({ id: idSchema });

export const personalSocialBaseSchema = z.object({
  id: idSchema,
  personalId: z.number().int(),
  social: z.string().max(50, { message: "Must be 50 characters or fewer" }),
  username: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  url: z.string().url({ message: "Invalid url" }).max(255),
});

export const personalSocialCreateSchema = personalSocialBaseSchema.omit({
  id: true,
});
export const personalSocialUpdateSchema = personalSocialCreateSchema
  .partial()
  .extend({ id: idSchema });

export const personalLocationBaseSchema = z.object({
  id: idSchema,
  personalId: z.number().int(),
  address: z
    .string()
    .max(255, { message: "Must be fewer than 255 characters" }),
  postalCode: z.string().length(5, { message: "Must be exactly 5 characters" }),
  city: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  countryCode: z.string().max(3, { message: "Must be 3 characters or fewer" }),
  state: z.string().max(100, { message: "Must be 100 characters or fewer" }),
});

export const personalLocationCreateSchema = personalLocationBaseSchema.omit({
  id: true,
});
export const personalLocationUpdateSchema = personalLocationCreateSchema
  .partial()
  .extend({ id: idSchema });

export const fullPersonalCreateSchema = z.object({
  basic: personalBasicBaseSchema,
  location: personalLocationBaseSchema,
  socials: z.array(personalSocialBaseSchema),
});

export const fullPersonalUpdateSchema = z.object({
  basic: personalBasicUpdateSchema,
  location: personalLocationUpdateSchema,
  socials: z.array(personalSocialUpdateSchema),
});

export type PersonalBasicBase = z.infer<typeof personalBasicBaseSchema>;
export type PersonalBasicCreate = z.infer<typeof personalBasicCreateSchema>;
export type PersonalBasicUpdate = z.infer<typeof personalBasicUpdateSchema>;
export type FullPersonalCreate = z.infer<typeof fullPersonalCreateSchema>;
export type FullPersonalUpdate = z.infer<typeof fullPersonalUpdateSchema>;
