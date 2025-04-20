import { BaseCrudService } from "./base.service";
import { courseRepository } from "./instance.repo";

import type {
  CourseDetailsInsert,
  CourseInsert,
  CourseSelect,
} from "../db/schema/course.db";
import { NotFoundError } from "../errors/not-found.error";

export class CourseService extends BaseCrudService<CourseSelect, CourseInsert> {
  constructor(private readonly repo = courseRepository) {
    super(repo);
  }

  async getDetailById(detailId: number) {
    const record = await this.repo.getDetail(detailId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${detailId} not found`);
    }
    return record;
  }

  async addDetails(courseId: number, newCourseDetail: CourseDetailsInsert) {
    const record = await this.repo.addDetail(courseId, newCourseDetail);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(
    detailId: number,
    newDetail: Partial<CourseDetailsInsert>,
  ) {
    const exists = await this.repo.getDetail(detailId);
    if (!exists) {
      throw new NotFoundError(`cannot update: detail ${detailId} not found`);
    }
    return this.repo.updateDetail(detailId, newDetail);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(`cannot delete: detail ${id} not found`);
    }
    return this.repo.deleteCourseWithDetails(id);
  }
}
