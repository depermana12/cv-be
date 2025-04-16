import { BaseCrudService } from "./base.service";
import { courseRepository } from "./instance.repo";
import { courses } from "../db/schema/course.db";
import type { CourseDetailsInsert } from "../db/index.types";

export class Course extends BaseCrudService<typeof courses> {
  constructor() {
    super(courseRepository, "id");
  }

  async getDetailById(detailId: number) {
    return courseRepository.getDetailById(detailId);
  }

  async addDetails(courseId: number, newCourseDetail: CourseDetailsInsert) {
    return courseRepository.addDetails(courseId, newCourseDetail);
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    return courseRepository.updateDetails(detailId, newDetail);
  }

  override async delete(id: number) {
    return courseRepository.deleteCourseWithDetails(id);
  }
}
