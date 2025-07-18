import { and, asc, desc, eq, like, sql } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { courses } from "../db/schema/course.db";
import type {
  CourseInsert,
  CourseUpdate,
  CourseSelect,
  CourseQueryOptions,
} from "../db/types/course.type";
import type { Database } from "../db/index";

export class CourseRepository extends CvChildRepository<
  typeof courses,
  CourseInsert,
  CourseSelect,
  "id"
> {
  constructor(db: Database) {
    super(courses, db, "id");
  }

  async getCourse(
    cvId: number,
    courseId: number,
  ): Promise<CourseSelect | null> {
    return this.getByIdInCv(cvId, courseId);
  }

  async getAllCourses(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<CourseSelect[]> {
    const whereClause = [eq(courses.cvId, cvId)];
    if (options?.search) {
      whereClause.push(
        like(
          sql`lower(${courses.courseName})`,
          `%${options.search.toLowerCase()}%`,
        ),
      );
    }

    return this.db
      .select()
      .from(courses)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(courses[options.sortBy])
            : asc(courses[options.sortBy])
          : asc(courses.id),
      );
  }

  async createCourse(
    cvId: number,
    courseData: CourseInsert,
  ): Promise<CourseSelect> {
    return this.createInCv(cvId, courseData);
  }

  async updateCourse(
    cvId: number,
    courseId: number,
    courseData: CourseUpdate,
  ): Promise<CourseSelect> {
    return this.updateInCv(cvId, courseId, courseData);
  }

  async deleteCourse(cvId: number, courseId: number): Promise<boolean> {
    return this.deleteInCv(cvId, courseId);
  }
}
