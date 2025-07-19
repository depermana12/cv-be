import { CvChildService } from "./cvChild.service";
import type {
  CourseInsert,
  CourseSelect,
  CourseUpdate,
} from "../db/types/course.type";
import { CourseRepository } from "../repositories/course.repo";

export interface ICourseService {
  updateCourse(
    cvId: number,
    courseId: number,
    updateData: CourseUpdate,
  ): Promise<CourseSelect>;
}

export class CourseService
  extends CvChildService<CourseSelect, CourseInsert>
  implements ICourseService
{
  constructor(private readonly courseRepository: CourseRepository) {
    super(courseRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateCourse(cvId: number, courseId: number, updateData: CourseUpdate) {
    return this.updateInCv(cvId, courseId, updateData);
  }
}
