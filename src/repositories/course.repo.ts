import { eq } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { courses, courseDescriptions } from "../db/schema/course.db";
import type { CourseInsert, CourseDescInsert } from "../db/types/course.type";
import { getDb } from "../db";

const db = await getDb();
export class CourseRepository extends BaseRepository<
  typeof courses,
  CourseInsert
> {
  constructor() {
    super(courses, db);
  }
  async getDescription(descId: number) {
    const rows = await this.db
      .select()
      .from(courseDescriptions)
      .where(eq(courseDescriptions.courseId, descId));
    return rows[0] ?? null;
  }

  async addDescription(courseId: number, description: CourseDescInsert) {
    const insertedDetail = await this.db
      .insert(courseDescriptions)
      .values({ ...description, courseId })
      .$returningId();
    return this.getById(insertedDetail[0].id);
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<CourseDescInsert>,
  ) {
    await this.db
      .update(courseDescriptions)
      .set(newDescription)
      .where(eq(courseDescriptions.id, descId));
    return this.getDescription(descId);
  }

  async deleteCourseCascade(id: number) {
    await this.db
      .delete(courseDescriptions)
      .where(eq(courseDescriptions.courseId, id));
    await this.db.delete(courses).where(eq(courses.id, id));
  }
}
