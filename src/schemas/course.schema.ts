import { z } from "zod";

const idSchema = z.number().int().positive();

export const courseSelectSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  provider: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  courseName: z
    .string()
    .max(200, { message: "Must be 200 characters or fewer" }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const courseInsertSchema = courseSelectSchema.omit({
  id: true,
  personalId: true,
});

export const courseUpdateSchema = courseInsertSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type CourseSelect = z.infer<typeof courseSelectSchema>;
export type CourseInsert = z.infer<typeof courseInsertSchema>;
export type CourseUpdate = z.infer<typeof courseUpdateSchema>;

export const courseDescSelectSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  description: z.string(),
});

export const courseDescInsertSchema = courseDescSelectSchema.omit({
  id: true,
  courseId: true,
});

export const courseDescUpdateSchema = courseDescInsertSchema.partial().extend({
  id: idSchema,
});

export type CourseDescSelect = z.infer<typeof courseDescSelectSchema>;
export type CourseDescInsert = z.infer<typeof courseDescInsertSchema>;
export type CourseDescUpdate = z.infer<typeof courseDescUpdateSchema>;
