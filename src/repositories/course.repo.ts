import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { courses, courseDetails } from "../db/schema/course.db";
import type { CourseInsert, CourseDetailsInsert } from "../db/schema/course.db";

export class CourseRepository extends BaseRepository<
  typeof courses,
  CourseInsert
> {
  constructor() {
    super(db, courses);
  }
  async getDetail(detailId: number) {
    const rows = await this.db
      .select()
      .from(courseDetails)
      .where(eq(courseDetails.id, detailId));
    return rows[0];
  }

  async addDetail(courseId: number, newCourseDetail: CourseDetailsInsert) {
    const insertedDetail = await this.db
      .insert(courseDetails)
      .values({ ...newCourseDetail, courseId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetail(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    await this.db
      .update(courseDetails)
      .set(newDetail)
      .where(eq(courseDetails.id, detailId));
    return this.getDetail(detailId);
  }

  async deleteCourseWithDetails(id: number) {
    await this.db.delete(courseDetails).where(eq(courseDetails.courseId, id));
    await this.db.delete(courses).where(eq(courses.id, id));
  }
}
