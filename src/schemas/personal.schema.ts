import { z } from "zod";

const idSchema = z.number().int().positive();

export const basicBaseSchema = z.object({
  id: idSchema,
  fullName: z
    .string()
    .min(3, { message: "Fullname must be 3 or more characters long" })
    .max(100),
  bio: z.string().max(255, { message: "Bio must be 255 characters or fewer" }),
  image: z
    .string()
    .max(255, { message: "Image link must be 255 characters or fewer" }),
  summary: z.string(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Only number or +country code format is accepted",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  url: z.string().url({ message: "Invalid url" }),
});

export const basicCreateSchema = basicBaseSchema.omit({
  id: true,
});
export const basicUpdateSchema = basicCreateSchema
  .partial()
  .extend({ id: idSchema });

export const socialBaseSchema = z.object({
  id: idSchema,
  personalId: z.number().int(),
  social: z
    .string()
    .max(50, { message: "Social network name must be 50 characters or fewer" }),
  username: z
    .string()
    .max(100, { message: "Username must be 100 characters or fewer" }),
  url: z.string().url({ message: "Invalid url" }).max(255),
});

export const socialCreateSchema = socialBaseSchema.omit({
  id: true,
  personalId: true,
});
export const socialUpdateSchema = socialCreateSchema
  .partial()
  .extend({ id: idSchema });

export const locationBaseSchema = z.object({
  id: idSchema,
  personalId: z.number().int(),
  address: z
    .string()
    .max(255, { message: "Address must be fewer than 255 characters" }),
  postalCode: z
    .string()
    .length(5, { message: "Postal code must be exactly 5 characters" }),
  city: z
    .string()
    .max(100, { message: "City name must be 100 characters or fewer" }),
  countryCode: z
    .string()
    .max(3, { message: "Country code must be 3 characters or fewer" }),
  state: z
    .string()
    .max(100, { message: "State must be 100 characters or fewer" }),
});

//spotted
export const locationCreateSchema = locationBaseSchema.omit({
  id: true,
  personalId: true,
});

export const locationUpdateSchema = locationCreateSchema
  .partial()
  .extend({ id: idSchema });

export const personalCreateSchema = z.object({
  basic: basicCreateSchema,
  location: locationCreateSchema,
  socials: z.array(socialCreateSchema),
});

export const personalUpdateSchema = z.object({
  basic: basicUpdateSchema.optional(),
  location: locationUpdateSchema.optional(),
  socials: z.array(socialUpdateSchema).optional(),
});

export type BasicBase = z.infer<typeof basicBaseSchema>;
export type BasicCreate = z.infer<typeof basicCreateSchema>;
export type BasicUpdate = z.infer<typeof basicUpdateSchema>;

export type LocationBase = z.infer<typeof locationBaseSchema>;
export type LocationCreate = z.infer<typeof locationCreateSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;

export type SocialBase = z.infer<typeof socialBaseSchema>;
export type SocialCreate = z.infer<typeof socialCreateSchema>;
export type SocialUpdate = z.infer<typeof socialUpdateSchema>;

export type PersonalCreate = z.infer<typeof personalCreateSchema>;
export type PersonalUpdate = z.infer<typeof personalUpdateSchema>;
