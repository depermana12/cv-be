import { z } from "zod";

const idSchema = z.number().int().positive();

export const locationSelectSchema = z.object({
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

export const locationInsertSchema = locationSelectSchema.omit({
  id: true,
  personalId: true,
});

export const locationUpdateSchema = locationInsertSchema
  .extend({ id: idSchema })
  .partial();

export type LocationSelect = z.infer<typeof locationSelectSchema>;
export type LocationCreate = z.infer<typeof locationInsertSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
