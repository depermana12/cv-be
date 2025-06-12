import { z } from "zod";

const idSchema = z.number().int().positive();

export const locationSelectSchema = z.object({
  id: idSchema,
  cvId: z.number().int(),
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
  cvId: true,
});

export const locationQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["city", "state"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const locationUpdateSchema = locationInsertSchema.partial();

export type LocationSelect = z.infer<typeof locationSelectSchema>;
export type LocationCreate = z.infer<typeof locationInsertSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
export type LocationQueryOptions = z.infer<typeof locationQueryOptionsSchema>;
