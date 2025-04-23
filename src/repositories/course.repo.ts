import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { BaseRepository } from "./base.repo";
import { courses, courseDescriptions } from "../db/schema/course.db";
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
      .from(courseDescriptions)
      .where(eq(courseDescriptions.id, detailId));
    return rows[0];
  }

  async addDetail(courseId: number, newCourseDetail: CourseDetailsInsert) {
    const insertedDetail = await this.db
      .insert(courseDescriptions)
      .values({ ...newCourseDetail, courseId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDetail(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    await this.db
      .update(courseDescriptions)
      .set(newDetail)
      .where(eq(courseDescriptions.id, detailId));
    return this.getDetail(detailId);
  }

  async deleteCourseWithDetails(id: number) {
    await this.db
      .delete(courseDescriptions)
      .where(eq(courseDescriptions.courseId, id));
    await this.db.delete(courses).where(eq(courses.id, id));
  }
}
