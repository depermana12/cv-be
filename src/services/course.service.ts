import { CvChildService } from "./cvChild.service";
import { courseRepository } from "./instance.repo";
import type {
  CourseDescInsert,
  CourseDescSelect,
  CourseDescUpdate,
  CourseInsert,
  CourseQueryOptions,
  CourseSelect,
  CourseUpdate,
} from "../db/types/course.type";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export class CourseService extends CvChildService<
  CourseSelect,
  CourseInsert,
  CourseUpdate
> {
  constructor(private readonly repo = courseRepository) {
    super(repo);
  }

  async createCourse(
    cvId: number,
    courseData: CourseInsert,
  ): Promise<CourseSelect> {
    return this.createOwnedByCv(cvId, courseData);
  }

  async getCourse(cvId: number, courseId: number): Promise<CourseSelect> {
    return this.getOwnedByCv(cvId, courseId);
  }

  async getAllCourses(cvId: number): Promise<CourseSelect[]> {
    return this.getAllOwnedByCv(cvId);
  }

  async updateCourse(
    cvId: number,
    courseId: number,
    newCourseData: CourseUpdate,
  ): Promise<CourseSelect> {
    return this.updateOwnedByCv(cvId, courseId, newCourseData);
  }

  async deleteCourse(cvId: number, courseId: number): Promise<boolean> {
    return this.deleteOwnedByCv(cvId, courseId);
  }

  /**
   * Utility function that asserts that the course belongs to the specified CV.
   * @param cvId - The ID of the CV.
   * @param courseId - The ID of the course.
   * @returns The course if it exists and belongs to the CV.
   * @throws NotFoundError if the course does not exist or does not belong to the CV.
   */
  private async assertCourseOwnedByCv(
    cvId: number,
    courseId: number,
  ): Promise<CourseSelect> {
    return this.getOwnedByCv(cvId, courseId);
  }

  /**
   * All below are description related methods for courses.
   * whether single CRUD operations or bulk operations.
   */

  async createDescriptionForCourse(
    cvId: number,
    courseId: number,
    descriptionData: CourseDescInsert,
  ): Promise<CourseDescSelect> {
    await this.assertCourseOwnedByCv(cvId, courseId);

    const description = await this.repo.createDescription(
      courseId,
      descriptionData,
    );

    if (!description) {
      throw new BadRequestError(
        `cannot create description for ${courseId} bad request`,
      );
    }
    return this.getCourseDescription(cvId, description.id);
  }

  async getCourseDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<CourseDescSelect> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(
        `cannot get: description ${descriptionId} not found`,
      );
    }

    await this.assertCourseOwnedByCv(cvId, description.courseId);

    return description;
  }

  async getCourseDescriptions(
    cvId: number,
    courseId: number,
  ): Promise<CourseDescSelect[]> {
    await this.assertCourseOwnedByCv(cvId, courseId);
    const descriptions = await this.repo.getAllDescriptions(courseId);

    return descriptions;
  }

  async updateCourseDescription(
    cvId: number,
    descriptionId: number,
    newDescriptionData: CourseDescUpdate,
  ): Promise<CourseDescSelect> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.assertCourseOwnedByCv(cvId, description.courseId);

    const updatedDescription = await this.repo.updateDescription(
      descriptionId,
      newDescriptionData,
    );
    if (!updatedDescription) {
      throw new BadRequestError(
        `failed to update description: ${descriptionId}`,
      );
    }
    return this.getCourseDescription(cvId, descriptionId);
  }

  async deleteCourseDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.assertCourseOwnedByCv(cvId, description.courseId);

    const deletedDescription = await this.repo.deleteDescription(descriptionId);
    if (!deletedDescription) {
      throw new BadRequestError(
        `cannot delete: description ${descriptionId} not found`,
      );
    }
    return deletedDescription;
  }

  /**
   * Bulk operations: creates a course along with its descriptions.
   * @param cvId - The ID of the CV to which the course belongs.
   * @param courseData - The data for the course to be created.
   * @param descriptions - An array of descriptions to be associated with the course.
   * @returns A composite object containing the created course and its descriptions.
   */
  async createCourseWithDescriptions(
    cvId: number,
    courseData: CourseInsert,
    descriptions: CourseDescInsert[],
  ): Promise<CourseSelect & { descriptions: CourseDescSelect[] }> {
    if (courseData.cvId !== cvId) {
      throw new BadRequestError(
        `cvId: ${cvId} mismatch with courseData.cvId: ${courseData.cvId}`,
      );
    }

    const { id } = await this.repo.createCourseWithDescriptions(
      courseData,
      descriptions,
    );

    const courseWithDescriptions =
      await this.repo.getCourseByIdWithDescriptions(id);
    if (!courseWithDescriptions) {
      throw new NotFoundError(
        `Cannot find course with id ${id} after creation`,
      );
    }
    return courseWithDescriptions;
  }

  /**
   * Retrieves all courses along with their descriptions for a given CV.
   * @param cvId - The ID of the CV to retrieve courses from.
   * @param options - Optional query options for searching, sorting, and ordering.
   * @param options.search - Optional search term to filter courses by name
   * @param options.sortBy - Optional field to sort courses by (e.g., 'name').
   * @param options.sortOrder - Optional sort order ('asc' or 'desc').
   * @returns An array of courses with their associated descriptions.
   */
  async getAllCoursesWithDescriptions(
    cvId: number,
    options?: CourseQueryOptions,
  ): Promise<(CourseSelect & { descriptions: CourseDescSelect[] })[]> {
    return this.repo.getAllByIdWithDescriptions(cvId);
  }

  async deleteCourseWithDescriptions(
    cvId: number,
    courseId: number,
  ): Promise<boolean> {
    await this.assertCourseOwnedByCv(cvId, courseId);
    const deleted = await this.repo.deleteCourseWithDescriptions(courseId);
    if (!deleted) {
      throw new BadRequestError(`cannot delete: course ${courseId} not found`);
    }
    return deleted;
  }
}
