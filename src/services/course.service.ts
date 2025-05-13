import { BaseCrudService } from "./base.service";
import { courseRepository } from "./instance.repo";

import type {
  CourseDescInsert,
  CourseInsert,
  CourseSelect,
} from "../db/types/course.type";
import { NotFoundError } from "../errors/not-found.error";

export class CourseService extends BaseCrudService<CourseSelect, CourseInsert> {
  constructor(private readonly repo = courseRepository) {
    super(repo);
  }

  async getDetailById(detailId: number) {
    const record = await this.repo.getDescription(detailId);
    if (!record) {
      throw new NotFoundError(`cannot get: detail ${detailId} not found`);
    }
    return record;
  }

  async addDetails(courseId: number, newCourseDetail: CourseDescInsert) {
    const record = await this.repo.addDescription(courseId, newCourseDetail);
    if (!record) {
      throw new Error("failed to create the record.");
    }
    return record;
  }

  async updateDetails(detailId: number, newDetail: Partial<CourseDescInsert>) {
    const exists = await this.repo.getDescription(detailId);
    if (!exists) {
      throw new NotFoundError(`cannot update: detail ${detailId} not found`);
    }
    return this.repo.updateDescription(detailId, newDetail);
  }

  override async delete(id: number) {
    const exists = await this.getDetailById(id);
    if (!exists) {
      throw new NotFoundError(`cannot delete: detail ${id} not found`);
    }
    return this.repo.deleteCourseCascade(id);
  }
}
