import type { ICvRepository } from "../repositories/cv.repo";
import type {
  CvInsert,
  CvQueryOptions,
  CvSelect,
  CvStats,
  CvUpdate,
  CvMinimalSelect,
  PaginatedCvResponse,
  CompleteCvResponse,
  ThemeUpdate,
  ThemeStyle,
} from "../db/types/cv.type";
import { NotFoundError } from "../errors/not-found.error";

// Import concrete child repository classes
import type { ContactRepository } from "../repositories/cvChildren/contact.repo";
import type { EducationRepository } from "../repositories/cvChildren/education.repo";
import type { WorkRepository } from "../repositories/cvChildren/work.repo";
import type { ProjectRepository } from "../repositories/cvChildren/project.repo";
import type { OrganizationRepository } from "../repositories/cvChildren/organization.repo";
import type { CourseRepository } from "../repositories/cvChildren/course.repo";
import type { SkillRepository } from "../repositories/cvChildren/skill.repo";
import type { LanguageRepository } from "../repositories/cvChildren/language.repo";

export interface ICvService {
  createCv(cvData: Omit<CvInsert, "userId">, userId: number): Promise<CvSelect>;
  getCvById(cvId: number, userId: number): Promise<CvSelect>;
  getAllCvs(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse>;
  updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect>;
  deleteCv(cvId: number, userId: number): Promise<boolean>;

  getCvByUsernameAndSlug(
    username: string,
    slug: string,
  ): Promise<CompleteCvResponse>;
  downloadCv(cvId: number): Promise<CvSelect>;
  getPopularCvs(limit?: number): Promise<CvSelect[]>;
  getUserStats(userId: number): Promise<CvStats>;
  checkSlugAvailability(
    slug: string,
    excludeCvId?: number,
  ): Promise<{ available: boolean; slug: string }>;
  getCvData(cvId: number, userId: number): Promise<CompleteCvResponse>;
  getCvStyles(
    cvId: number,
    userId: number,
    style: "modern" | "minimal",
  ): Promise<ThemeStyle>;
  updateSectionOrder(
    cvId: number,
    userId: number,
    sections: string[],
  ): Promise<void>;
  updateCvTheme(
    cvId: number,
    userId: number,
    updateTheme: ThemeUpdate,
  ): Promise<void>;
}

export class CvService implements ICvService {
  constructor(
    private readonly cvRepository: ICvRepository,
    private readonly contactRepository: ContactRepository,
    private readonly educationRepository: EducationRepository,
    private readonly workRepository: WorkRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly courseRepository: CourseRepository,
    private readonly skillRepository: SkillRepository,
    private readonly languageRepository: LanguageRepository,
  ) {}

  /**
   * Validates that a CV exists and belongs to the specified user.
   * @param cvId - CV ID
   * @param userId - User ID
   * @returns The CV if found and owned by user
   * @throws NotFoundError if CV doesn't exist or doesn't belong to user
   */
  private async validateCvOwnership(
    cvId: number,
    userId: number,
  ): Promise<CvSelect> {
    const cv = await this.cvRepository.getCvForUser(cvId, userId);
    if (!cv) {
      throw new NotFoundError(
        `CV with ID ${cvId} not found or not accessible for user ${userId}`,
      );
    }
    return cv;
  }

  /**
   * Creates a new CV for the specified user.
   * @param cvData - CV data (without userId)
   * @param userId - ID of the user creating the CV
   * @returns The created CV with full details
   */
  async createCv(
    cvData: Omit<CvInsert, "userId">,
    userId: number,
  ): Promise<CvSelect> {
    const createdCv = await this.cvRepository.createCv({ ...cvData, userId });
    return this.getCvById(createdCv.id, userId);
  }

  /**
   * Retrieves a CV by ID, ensuring user ownership.
   * @param cvId - CV ID
   * @param userId - User ID
   * @returns The CV if found and accessible
   */
  async getCvById(cvId: number, userId: number): Promise<CvSelect> {
    return this.validateCvOwnership(cvId, userId);
  }

  /**
   * Retrieves all CVs for a user with optional filtering and pagination.
   * @param userId - User ID
   * @param options - Query options for filtering, sorting, and pagination
   * @returns Paginated list of CVs
   */
  async getAllCvs(
    userId: number,
    options?: CvQueryOptions,
  ): Promise<PaginatedCvResponse> {
    return this.cvRepository.getAllCvForUser(userId, options);
  }

  /**
   * Updates a CV and ensures user ownership.
   * @param cvId - CV ID
   * @param userId - User ID
   * @param newCvData - Updated CV data
   * @returns The updated CV
   */
  async updateCv(
    cvId: number,
    userId: number,
    newCvData: CvUpdate,
  ): Promise<CvSelect> {
    await this.validateCvOwnership(cvId, userId);

    const updatedCv = await this.cvRepository.updateCvForUser(
      cvId,
      userId,
      newCvData,
    );
    if (!updatedCv) {
      throw new NotFoundError(
        `Failed to update CV with ID ${cvId} for user ${userId}`,
      );
    }

    return this.getCvById(cvId, userId);
  }

  /**
   * Deletes a CV and ensures user ownership.
   * @param cvId - CV ID
   * @param userId - User ID
   * @returns True if deletion was successful
   */
  async deleteCv(cvId: number, userId: number): Promise<boolean> {
    await this.validateCvOwnership(cvId, userId);
    return this.cvRepository.deleteCvForUser(cvId, userId);
  }

  /**
   * Retrieves a public CV by username and slug with complete data.
   * @param username - Username of CV owner
   * @param slug - CV slug
   * @returns Complete CV data with all sections
   */
  async getCvByUsernameAndSlug(
    username: string,
    slug: string,
  ): Promise<CompleteCvResponse> {
    const cv = await this.cvRepository.getCvByUsernameAndSlug(username, slug);
    if (!cv) {
      throw new NotFoundError(
        `CV with slug '${slug}' not found for user '${username}'`,
      );
    }

    if (!cv.isPublic) {
      throw new NotFoundError(
        `CV with slug '${slug}' for user '${username}' is not publicly available`,
      );
    }

    await this.cvRepository.incrementViews(cv.id);

    const [
      contacts,
      educations,
      works,
      projects,
      organizations,
      courses,
      skills,
      languages,
    ] = await Promise.all([
      this.contactRepository.getAll(cv.id),
      this.educationRepository.getAll(cv.id),
      this.workRepository.getAll(cv.id),
      this.projectRepository.getAll(cv.id),
      this.organizationRepository.getAll(cv.id),
      this.courseRepository.getAll(cv.id),
      this.skillRepository.getAll(cv.id),
      this.languageRepository.getAll(cv.id),
    ]);

    return {
      id: cv.id,
      title: cv.title,
      description: cv.description,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
      views: cv.views + 1,
      contacts,
      educations,
      works,
      projects,
      organizations,
      courses,
      skills,
      languages,
    } as CompleteCvResponse;
  }

  /**
   * Downloads a public CV and increments download count.
   * @param cvId - CV ID
   * @returns CV data with updated download count
   */
  async downloadCv(cvId: number): Promise<CvSelect> {
    const cv = await this.cvRepository.getCvById(cvId);
    if (!cv) {
      throw new NotFoundError(`CV with ID ${cvId} not found`);
    }

    if (!cv.isPublic) {
      throw new NotFoundError(`CV with ID ${cvId} is not publicly available`);
    }

    await this.cvRepository.incrementDownloads(cvId);
    return { ...cv, downloads: cv.downloads + 1 };
  }

  /**
   * Retrieves popular CVs based on views and downloads.
   * @param limit - Maximum number of CVs to return
   * @returns Array of popular CVs
   */
  async getPopularCvs(limit = 10): Promise<CvSelect[]> {
    return this.cvRepository.getPopularCvs(limit);
  }

  /**
   * Retrieves user CV statistics.
   * @param userId - User ID
   * @returns User CV statistics
   */
  async getUserStats(userId: number): Promise<CvStats> {
    return this.cvRepository.getUserCvStats(userId);
  }

  /**
   * Checks if a slug is available for use.
   * @param slug - Slug to check
   * @param excludeCvId - CV ID to exclude from check
   * @returns Availability status and slug
   */
  async checkSlugAvailability(
    slug: string,
    excludeCvId?: number,
  ): Promise<{ available: boolean; slug: string }> {
    const available = await this.cvRepository.checkSlugAvailability(
      slug,
      excludeCvId,
    );

    return {
      available,
      slug,
    };
  }

  async updateSectionOrder(cvId: number, userId: number, sections: string[]) {
    await this.validateCvOwnership(cvId, userId);
    await this.cvRepository.updateSectionOrder(cvId, userId, sections);
  }

  async updateCvTheme(cvId: number, userId: number, updateTheme: ThemeUpdate) {
    await this.validateCvOwnership(cvId, userId);
    await this.cvRepository.updateCvTheme(cvId, userId, updateTheme);
  }

  async getSectionOrder(cvId: number, userId: number) {
    const cv = await this.getCvById(cvId, userId);
    if (!cv) {
      throw new NotFoundError(`CV with ID ${cvId} not found`);
    }
    return cv.sections.order;
  }

  async getCvStyles(cvId: number, userId: number, style: "modern" | "minimal") {
    const cv = await this.getCvById(cvId, userId);
    if (!cv) {
      throw new NotFoundError(`CV with ID ${cvId} not found`);
    }
    return cv.themes[style];
  }

  async getCvData(cvId: number, userId: number) {
    const cv = await this.getCvById(cvId, userId);
    if (!cv) {
      throw new NotFoundError(`CV with ID ${cvId} not found`);
    }

    const [
      contacts,
      educations,
      works,
      projects,
      organizations,
      courses,
      skills,
      languages,
    ] = await Promise.all([
      this.contactRepository.getAll(cv.id),
      this.educationRepository.getAll(cv.id),
      this.workRepository.getAll(cv.id),
      this.projectRepository.getAll(cv.id),
      this.organizationRepository.getAll(cv.id),
      this.courseRepository.getAll(cv.id),
      this.skillRepository.getAll(cv.id),
      this.languageRepository.getAll(cv.id),
    ]);

    return {
      contacts,
      educations,
      works,
      projects,
      organizations,
      courses,
      skills,
      languages,
    } as CompleteCvResponse;
  }

  async getCvDataOrdered(cvId: number, userId: number) {
    const sectionOrder = await this.getSectionOrder(cvId, userId);
    const cvDataSections = await this.getCvData(cvId, userId);

    const sectionMap: Record<string, any> = {
      contact: cvDataSections.contacts,
      education: cvDataSections.educations,
      work: cvDataSections.works,
      project: cvDataSections.projects,
      organization: cvDataSections.organizations,
      course: cvDataSections.courses,
      skill: cvDataSections.skills,
      language: cvDataSections.languages,
    };

    const orderedSections = sectionOrder.map((section: string) => ({
      section,
      data: sectionMap[section] ?? [],
    }));

    return orderedSections;
  }
}
