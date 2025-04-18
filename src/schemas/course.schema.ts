import { z } from "zod";

const idSchema = z.number().int().positive();

export const courseBaseSchema = z.object({
  id: idSchema,
  personalId: idSchema,
  provider: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  courseName: z
    .string()
    .max(200, { message: "Must be 200 characters or fewer" }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const courseCreateSchema = courseBaseSchema.omit({
  id: true,
  personalId: true,
});

export const courseUpdateSchema = courseCreateSchema
  .extend({
    id: idSchema,
  })
  .partial();

export type Course = z.infer<typeof courseBaseSchema>;
export type CourseCreate = z.infer<typeof courseCreateSchema>;
export type CourseUpdate = z.infer<typeof courseUpdateSchema>;

export const courseDetailBaseSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  description: z.string(),
});

export const courseDetailCreateSchema = courseDetailBaseSchema.omit({
  id: true,
  courseId: true,
});

export const courseDetailUpdateSchema = courseDetailCreateSchema
  .partial()
  .extend({
    id: idSchema,
  });

export type CourseDetail = z.infer<typeof courseDetailBaseSchema>;
export type CourseDetailCreate = z.infer<typeof courseDetailCreateSchema>;
export type CourseDetailUpdate = z.infer<typeof courseDetailUpdateSchema>;
