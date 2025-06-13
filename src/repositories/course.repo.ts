import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { courses, courseDescriptions } from "../db/schema/course.db";
import type {
  CourseInsert,
  CourseDescInsert,
  CourseUpdate,
  CourseSelect,
  CourseDescSelect,
  CourseResponse,
  CourseQueryOptions,
} from "../db/types/course.type";
import type { Database } from "../db/index";

export class CourseRepository extends CvChildRepository<
  typeof courses,
  CourseInsert,
  CourseSelect,
  CourseUpdate
> {
  constructor(db: Database) {
    super(courses, db);
  }

  async getCourse(id: number): Promise<CourseResponse | null> {
    const result = await this.db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        descriptions: true,
      },
    });
    return result ?? null;
  }

  async getAllCourses(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<CourseResponse[]> {
    const whereClause = [eq(courses.cvId, cvId)];
    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${courses.courseName})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    return this.db.query.courses.findMany({
      where: and(...whereClause),
      with: {
        descriptions: true,
      },
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "desc"
              ? desc(courses[options.sortBy])
              : asc(courses[options.sortBy]),
          ]
        : [],
    });
  }

  async createCourse(
    courseData: CourseInsert,
    descriptions: Omit<CourseDescInsert, "courseId">[],
  ): Promise<{ id: number }> {
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
      return { id: course.id };
    });
  }

  async updateCourse(
    courseId: number,
    courseData: CourseUpdate,
    descriptions?: Omit<CourseDescInsert, "courseId">[],
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Update main course if data provided
      if (Object.keys(courseData).length > 0) {
        const [result] = await tx
          .update(courses)
          .set(courseData)
          .where(eq(courses.id, courseId));
        if (result.affectedRows === 0) return false;
      }
      // Replace descriptions if provided
      if (descriptions !== undefined) {
        await tx
          .delete(courseDescriptions)
          .where(eq(courseDescriptions.courseId, courseId));
        if (descriptions.length > 0) {
          await tx
            .insert(courseDescriptions)
            .values(descriptions.map((desc) => ({ ...desc, courseId })));
        }
      }
      return true;
    });
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(courseDescriptions)
        .where(eq(courseDescriptions.courseId, id));
      const [result] = await tx.delete(courses).where(eq(courses.id, id));
      return result.affectedRows > 0;
    });
  }

  async createDescription(
    courseId: number,
    description: Omit<CourseDescInsert, "courseId">,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(courseDescriptions)
      .values({ ...description, courseId })
      .$returningId();

    return { id: desc.id };
  }

  async getDescription(descId: number): Promise<CourseDescSelect | null> {
    const [result] = await this.db
      .select()
      .from(courseDescriptions)
      .where(eq(courseDescriptions.id, descId));

    return result ?? null;
  }

  async getAllDescriptions(courseId: number): Promise<CourseDescSelect[]> {
    return this.db
      .select()
      .from(courseDescriptions)
      .where(eq(courseDescriptions.courseId, courseId));
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<CourseDescInsert>,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(courseDescriptions)
      .set(newDescription)
      .where(eq(courseDescriptions.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(courseDescriptions)
      .where(eq(courseDescriptions.id, descId));

    return result.affectedRows > 0;
  }
}
