import { CvChildService } from "./cvChild.service";
import type {
  CourseInsert,
  CourseQueryOptions,
  CourseSelect,
} from "../db/types/course.type";
import { CourseRepository } from "../repositories/course.repo";

export class CourseService extends CvChildService<CourseSelect, CourseInsert> {
  constructor(private readonly courseRepository: CourseRepository) {
    super(courseRepository);
  }

  async getAllCourses(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<CourseSelect[]> {
    return this.courseRepository.getAllCourses(cvId, options);
  }

  async getCourse(cvId: number, courseId: number): Promise<CourseSelect> {
    return this.getByIdInCv(cvId, courseId);
  }

  async createCourse(
    cvId: number,
    courseData: Omit<CourseInsert, "cvId">,
  ): Promise<CourseSelect> {
    return this.createInCv(cvId, { ...courseData, cvId });
  }

  async updateCourse(
    cvId: number,
    courseId: number,
    updateData: Omit<CourseInsert, "cvId">,
  ): Promise<CourseSelect> {
    return this.updateInCv(cvId, courseId, updateData);
  }

  async deleteCourse(cvId: number, courseId: number): Promise<boolean> {
    return this.deleteInCv(cvId, courseId);
  }
}
