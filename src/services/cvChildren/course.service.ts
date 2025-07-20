import { CvChildService } from "../cvChild.service";
import type { CourseInsert, CourseSelect } from "../../db/types/course.type";
import { CourseRepository } from "../../repositories/cvChildren/course.repo";

export class CourseService extends CvChildService<CourseSelect, CourseInsert> {
  constructor(private readonly courseRepository: CourseRepository) {
    super(courseRepository);
  }
}
