import { eq } from "drizzle-orm";
import { db } from "../db";
import { BaseRepository } from "./base.repo";
import { courses, courseDetails } from "../db/schema/course.db";
import type { CourseInsert, CourseDetailsInsert } from "../db/schema/course.db";

export class CourseRepository extends BaseRepository<
  typeof courses,
  CourseInsert
> {
  constructor() {
    super(courses, "id");
  }
  async getDetailById(detailId: number) {
    const rows = await db
      .select()
      .from(courseDetails)
      .where(eq(courseDetails.id, detailId));
    return rows[0];
  }

  async addDetails(courseId: number, newCourseDetail: CourseDetailsInsert) {
    const insertedDetail = await db
      .insert(courseDetails)
      .values({ ...newCourseDetail, courseId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    await db
      .update(courseDetails)
      .set(newDetail)
      .where(eq(courseDetails.id, detailId));
    return this.getDetailById(detailId);
  }

  async deleteCourseWithDetails(id: number) {
    await db.delete(courseDetails).where(eq(courseDetails.courseId, id));
    await db.delete(courses).where(eq(courses.id, id));
  }
}
