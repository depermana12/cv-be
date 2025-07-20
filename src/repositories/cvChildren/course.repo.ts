import { CvChildRepository } from "../cvChild.repo";
import { courses } from "../../db/schema/course.db";
import type { CourseInsert, CourseSelect } from "../../db/types/course.type";
import type { Database } from "../../db/index";

export class CourseRepository extends CvChildRepository<
  typeof courses,
  CourseInsert,
  CourseSelect,
  "id"
> {
  constructor(db: Database) {
    super(courses, db, "id");
  }
}
