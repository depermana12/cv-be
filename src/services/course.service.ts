import { CvChildService } from "./cvChild.service";
import type {
  CourseCreateRequest,
  CourseDescInsert,
  CourseDescSelect,
  CourseDescUpdate,
  CourseInsert,
  CourseQueryOptions,
  CourseResponse,
  CourseSelect,
  CourseUpdate,
  CourseUpdateRequest,
} from "../db/types/course.type";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";
import { CourseRepository } from "../repositories/course.repo";

export class CourseService extends CvChildService<
  CourseSelect,
  CourseInsert,
  CourseUpdate
> {
  constructor(private readonly courseRepository: CourseRepository) {
    super(courseRepository);
  }

  async getAllCourses(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<CourseResponse[]> {
    return this.courseRepository.getAllCourses(cvId, options);
  }

  async getCourse(cvId: number, courseId: number): Promise<CourseResponse> {
    const course = await this.courseRepository.getCourse(courseId);
    if (!course || course.cvId !== cvId) {
      throw new NotFoundError(`Course ${courseId} not found for CV ${cvId}`);
    }
    return course;
  }

  async createCourse(
    cvId: number,
    courseData: CourseCreateRequest,
  ): Promise<CourseResponse> {
    const { descriptions = [], ...rest } = courseData;
    const { id } = await this.courseRepository.createCourse(
      { ...rest, cvId },
      descriptions,
    );
    return this.getCourse(cvId, id);
  }

  async updateCourse(
    cvId: number,
    courseId: number,
    updateData: CourseUpdateRequest,
  ): Promise<CourseResponse> {
    await this.getCourse(cvId, courseId);
    const { descriptions, ...courseData } = updateData;
    await this.courseRepository.updateCourse(
      courseId,
      courseData,
      descriptions,
    );
    return this.getCourse(cvId, courseId);
  }

  async deleteCourse(cvId: number, courseId: number): Promise<boolean> {
    await this.getCourse(cvId, courseId);
    return this.courseRepository.deleteCourse(courseId);
  }

  async getAllDescriptions(
    cvId: number,
    courseId: number,
  ): Promise<CourseDescSelect[]> {
    await this.getCourse(cvId, courseId);
    return this.courseRepository.getAllDescriptions(courseId);
  }

  async addDescription(
    cvId: number,
    courseId: number,
    descriptionData: Omit<CourseDescInsert, "courseId">,
  ): Promise<CourseDescSelect> {
    await this.getCourse(cvId, courseId);
    const result = await this.courseRepository.createDescription(
      courseId,
      descriptionData,
    );
    if (!result) throw new BadRequestError(`Failed to add description`);
    return this.getDescription(cvId, result.id);
  }

  async getDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<CourseDescSelect> {
    const description = await this.courseRepository.getDescription(
      descriptionId,
    );
    if (!description)
      throw new NotFoundError(`Description ${descriptionId} not found`);
    await this.getCourse(cvId, description.courseId);
    return description;
  }

  async updateDescription(
    cvId: number,
    descriptionId: number,
    newDescriptionData: CourseDescUpdate,
  ): Promise<CourseDescSelect> {
    const description = await this.courseRepository.getDescription(
      descriptionId,
    );
    if (!description)
      throw new NotFoundError(`Description ${descriptionId} not found`);
    await this.getCourse(cvId, description.courseId);
    const updated = await this.courseRepository.updateDescription(
      descriptionId,
      newDescriptionData,
    );
    if (!updated) throw new BadRequestError(`Failed to update description`);
    return this.getDescription(cvId, descriptionId);
  }

  async deleteDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.courseRepository.getDescription(
      descriptionId,
    );
    if (!description)
      throw new NotFoundError(`Description ${descriptionId} not found`);
    await this.getCourse(cvId, description.courseId);
    return this.courseRepository.deleteDescription(descriptionId);
  }
}
