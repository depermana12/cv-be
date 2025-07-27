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

  private async assertCvOwnedByUser(
    cvId: number,
    userId: number,
  ): Promise<CvSelect> {
    const cv = await this.cvRepository.getCvForUser(cvId, userId);
    if (!cv) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return cv;
  }

  async createCv(cvData: Omit<CvInsert, "userId">, userId: number) {
    const { id } = await this.cvRepository.createCv({ ...cvData, userId });
    return this.getCvById(id, userId);
  }

  async getCvById(cvId: number, userId: number) {
    return this.assertCvOwnedByUser(cvId, userId);
  }

  async getAllCvs(userId: number, options?: CvQueryOptions) {
    return this.cvRepository.getAllCvForUser(userId, options);
  }

  async updateCv(cvId: number, userId: number, newCvData: CvUpdate) {
    const cv = await this.assertCvOwnedByUser(cvId, userId);
    const updated = await this.cvRepository.updateCvForUser(
      cv.id,
      userId,
      newCvData,
    );
    if (!updated) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return this.getCvById(cvId, userId);
  }

  async deleteCv(cvId: number, userId: number) {
    const cv = await this.cvRepository.getCvForUser(cvId, userId);
    if (!cv) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} not found for user ${userId}`,
      );
    }
    return this.cvRepository.deleteCvForUser(cvId, userId);
  }

  async getCvByUsernameAndSlug(username: string, slug: string) {
    const cv = await this.cvRepository.getCvByUsernameAndSlug(username, slug);
    if (!cv) {
      throw new NotFoundError(
        `[Service] CV with slug '${slug}' not found for user '${username}'`,
      );
    }

    // Only allow access to public CVs
    if (!cv.isPublic) {
      throw new NotFoundError(
        `[Service] CV with slug '${slug}' for user '${username}' is not publicly available`,
      );
    }

    // Increment view count when CV is accessed
    await this.cvRepository.incrementViews(cv.id);

    // Fetch all CV children sections
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

    // Return complete CV with all sections
    return {
      // Core CV info (minimal)
      id: cv.id,
      title: cv.title,
      description: cv.description,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
      views: cv.views + 1, // Include the incremented view count

      // CV sections (all ordered by displayOrder ASC from backend)
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

  async downloadCv(cvId: number) {
    const cv = await this.cvRepository.getCvById(cvId);
    if (!cv) {
      throw new NotFoundError(`[Service] CV with ID ${cvId} not found`);
    }

    // Only allow downloading of public CVs
    if (!cv.isPublic) {
      throw new NotFoundError(
        `[Service] CV with ID ${cvId} is not publicly available`,
      );
    }

    await this.cvRepository.incrementDownloads(cvId);

    return { ...cv, downloads: cv.downloads + 1 };
  }

  async getPopularCvs(limit = 10) {
    return this.cvRepository.getPopularCvs(limit);
  }

  async getUserStats(userId: number) {
    return this.cvRepository.getUserCvStats(userId);
  }

  async checkSlugAvailability(slug: string, excludeCvId?: number) {
    const available = await this.cvRepository.checkSlugAvailability(
      slug,
      excludeCvId,
    );

    return {
      available,
      slug,
    };
  }
}
