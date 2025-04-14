import { eq } from "drizzle-orm";

import { db } from "../db/index";
import { courses, courseDetails } from "../db/schema/course.db";
import type { CourseInsert, CourseDetailsInsert } from "../db/index.types";

export class Course {
  async getAll() {
    try {
      return await db.select().from(courses);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(courseId: number) {
    try {
      const rows = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(course: CourseInsert) {
    try {
      const insertedCourse = await db
        .insert(courses)
        .values(course)
        .$returningId();
      return this.getById(insertedCourse[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(courseId: number, newCourseData: Partial<CourseInsert>) {
    try {
      await db
        .update(courses)
        .set(newCourseData)
        .where(eq(courses.id, courseId));
      return this.getById(courseId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getDetailById(detailId: number) {
    try {
      const rows = await db
        .select()
        .from(courseDetails)
        .where(eq(courseDetails.id, detailId));
      return rows[0];
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async addDetails(courseId: number, newCourseDetail: CourseDetailsInsert) {
    try {
      const insertedDetail = await db
        .insert(courseDetails)
        .values({
          ...newCourseDetail,
          courseId,
        })
        .$returningId();
      return this.getById(insertedDetail[0].id);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async updateDetails(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    try {
      await db
        .update(courseDetails)
        .set(newDetail)
        .where(eq(courseDetails.id, detailId));
      return this.getDetailById(detailId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(id: number) {
    await db.delete(courseDetails).where(eq(courseDetails, id));
    await db.delete(courses).where(eq(courses.id, id));
  }
}
