import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { courses, courseDescriptions } from "../db/schema/course.db";
import type {
  CourseInsert,
  CourseDescInsert,
  CourseUpdate,
  CourseSelect,
  CourseDescSelect,
  CourseWithDescriptions,
  CourseQueryOptions,
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

  async getCourseByIdWithDescriptions(
    id: number,
  ): Promise<CourseWithDescriptions | null> {
    const result = await this.db.query.courses.findFirst({
      where: eq(courses.id, id),
      with: {
        descriptions: true,
      },
    });
    return result ?? null;
  }

  async getAllByIdWithDescriptions(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<CourseWithDescriptions[]> {
    // construct where clause for queries filtering in findmany
    const whereClause = [eq(courses.cvId, cvId)];

    /**
     * if search option is provided, push a condition to the where clause
     * mysql does not support ilike (insensitive) so i mimic it with like
     * but make it lower case
     * so the whereClause array will look like:
     * [eq(courses.cvId, cvId), like(LOWER(courses.courseName), '%searchTerm%')]
     */
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

  async createCourseWithDescriptions(
    courseData: CourseInsert,
    descriptions: CourseDescInsert[],
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

  async deleteCourseWithDescriptions(id: number): Promise<boolean> {
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
    description: CourseDescInsert,
  ): Promise<{ id: number }> {
    const [desc] = await this.db
      .insert(courseDescriptions)
      .values({ ...description, courseId })
      .$returningId();

    return { id: desc.id };
  }

  async getDescriptionById(descId: number): Promise<CourseDescSelect | null> {
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
