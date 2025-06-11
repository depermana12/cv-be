import { z } from "zod";

const idSchema = z.number().int().positive();

/**
 * Schema for selecting a course.
 * used as dto for getting a course,
 * and as base schema for inserting and updating a course.
 */

export const courseSelectSchema = z.object({
  id: idSchema,
  cvId: idSchema,
  provider: z.string().max(100, { message: "Must be 100 characters or fewer" }),
  courseName: z
    .string()
    .max(200, { message: "Must be 200 characters or fewer" }),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

/**
 * Schema for inserting a course.
 * used in controllers for validation.
 * omit id, because it is auto-generated,
 * omit cvId, because it is dynamically added from param cv,
 */

export const courseInsertSchema = courseSelectSchema.omit({
  id: true,
  cvId: true,
});

/**
 * Schema for updating a course.
 * used in controllers for validation.
 * from courseInsertSchema, omit cvId, because we don't want to update it,
 * and omit id, because it is from url param and not from body,
 * make all fields optional, because we want to allow partial updates.
 */

export const courseUpdateSchema = courseInsertSchema.partial();

export type CourseSelect = z.infer<typeof courseSelectSchema>;
export type CourseInsert = z.infer<typeof courseInsertSchema>;
export type CourseUpdate = z.infer<typeof courseUpdateSchema>;

/**
 * Schema for selecting a course description.
 * used as dto for getting a course description,
 * and as base schema for inserting and updating a course description.
 */

export const courseDescSelectSchema = z.object({
  id: idSchema,
  courseId: idSchema,
  description: z.string(),
});

/**
 * Schema for inserting a course description.
 * used in controllers for validation.
 * omit id, because it is from url param and not from body,
 * omit courseId, because it is dynamically added from param course,
 */

export const courseDescInsertSchema = courseDescSelectSchema.omit({
  id: true,
  courseId: true,
});

/**
 * Schema for updating a course description.
 * used in controllers for validation.
 * from courseDescInsertSchema, omit courseId, because we don't want to update it,
 * and omit id, because it is from url param and not from body,
 * make all fields optional, because we want to allow partial updates.
 */

export const courseDescUpdateSchema = courseDescInsertSchema.partial();

export const courseQueryOptionsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(["courseName", "provider", "startDate", "endDate"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
});

export type CourseDescSelect = z.infer<typeof courseDescSelectSchema>;
export type CourseDescInsert = z.infer<typeof courseDescInsertSchema>;
export type CourseDescUpdate = z.infer<typeof courseDescUpdateSchema>;

/**
 * Schema for inserting a course with descriptions.
 * used in controllers for validation.
 * from courseInsertSchema, omit cvId, because we don't want to update it,
 * and omit id, because it is from url param and not from body,
 * make all fields optional, because we want to allow partial updates.
 */
export const courseInsertWithDescSchema = courseInsertSchema.extend({
  descriptions: z.array(courseDescInsertSchema).optional(),
});

export type CourseInsertWithDesc = z.infer<typeof courseInsertWithDescSchema>;
