import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { courses, courseDescriptions } from "../db/schema/course.db";
import type {
  CourseInsert,
  CourseDescInsert,
  CourseUpdate,
  CourseSelect,
} from "../db/types/course.type";
import { getDb } from "../db";

const db = await getDb();
export class CourseRepository extends CvChildRepository<
  typeof courses,
  CourseInsert,
  CourseSelect,
  CourseUpdate
> {
  constructor() {
    super(courses, db);
  }

  async getByIdWithDescriptions(id: number) {
    return this.db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        descriptions: true,
      },
    });
  }

  async getAllByIdWithDescriptions(cvId: number) {
    return this.db.query.courses.findMany({
      where: eq(courses.cvId, cvId),
      with: {
        descriptions: true,
      },
    });
  }

  async createCourseWithDescriptions(
    courseData: CourseInsert,
    descriptions: CourseDescInsert[],
  ) {
    return this.db.transaction(async (tx) => {
      const [course] = await tx
        .insert(courses)
        .values(courseData)
        .$returningId();

      if (descriptions.length > 0) {
        await tx.insert(courseDescriptions).values(
          descriptions.map((desc) => ({
            ...desc,
            courseId: course.id,
          })),
        );
      }
      return course.id;
    });
  }

  async deleteCourseWithDescriptions(id: number) {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(courseDescriptions)
        .where(eq(courseDescriptions.courseId, id));
      const [result] = await tx.delete(courses).where(eq(courses.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(courseId: number, description: CourseDescInsert) {
    const [desc] = await this.db
      .insert(courseDescriptions)
      .values({ ...description, courseId })
      .$returningId();

    return desc.id;
  }

  async getDescriptionById(descId: number) {
    const [result] = await this.db
      .select()
      .from(courseDescriptions)
      .where(eq(courseDescriptions.id, descId));

    return result ?? null;
  }

  async getAllDescriptions(courseId: number) {
    return this.db
      .select()
      .from(courseDescriptions)
      .where(eq(courseDescriptions.courseId, courseId));
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<CourseDescInsert>,
  ) {
    const [result] = await this.db
      .update(courseDescriptions)
      .set(newDescription)
      .where(eq(courseDescriptions.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number) {
    const [result] = await this.db
      .delete(courseDescriptions)
      .where(eq(courseDescriptions.id, descId));

    return result.affectedRows > 0;
  }
}
