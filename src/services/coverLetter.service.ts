import type {
  CoverLetter,
  CoverLetterInsert,
  CoverLetterUpdate,
  CoverLetterCreate,
  CoverLetterUpdateData,
  CoverLetterQuery,
  CoverLetterTemplate,
  CoverLetterTemplateInsert,
  CoverLetterTemplateCreate,
  CoverLetterTemplateUpdateData,
  CoverLetterTemplateQuery,
  CoverLetterSection,
  CoverLetterSectionCreate,
  CoverLetterSectionUpdateData,
  GenerateFromTemplateData,
  CoverLetterStats,
  PaginatedCoverLetterTemplates,
  PaginatedCoverLetters,
  CoverLetterWithRelations,
} from "../db/types/coverLetter.type.js";
import type { CoverLetterRepository } from "../repositories/coverLetter.repo.js";
import { NotFoundError } from "../errors/not-found.error.js";

export class CoverLetterService {
  constructor(private coverLetterRepo: CoverLetterRepository) {}

  // ===== COVER LETTER TEMPLATES =====

  async createTemplate(
    userId: number,
    data: CoverLetterTemplateCreate,
  ): Promise<CoverLetterTemplate> {
    return this.coverLetterRepo.createTemplate({ ...data, userId });
  }

  async getTemplates(
    userId: number,
    query: CoverLetterTemplateQuery,
  ): Promise<PaginatedCoverLetterTemplates> {
    return this.coverLetterRepo.getTemplates(userId, query);
  }

  async getTemplateById(
    userId: number,
    templateId: number,
  ): Promise<CoverLetterTemplate | null> {
    return this.coverLetterRepo.getTemplateById(userId, templateId);
  }

  async updateTemplate(
    userId: number,
    templateId: number,
    data: CoverLetterTemplateUpdateData,
  ): Promise<CoverLetterTemplate | null> {
    return this.coverLetterRepo.updateTemplate(userId, templateId, data);
  }

  async deleteTemplate(userId: number, templateId: number): Promise<void> {
    return this.coverLetterRepo.deleteTemplate(userId, templateId);
  }

  // ===== COVER LETTERS =====

  async createCoverLetter(
    userId: number,
    data: CoverLetterCreate,
  ): Promise<CoverLetter> {
    // Verify CV belongs to user
    const cvExists = await this.coverLetterRepo.verifyCvOwnership(
      data.cvId,
      userId,
    );
    if (!cvExists) {
      throw new Error("CV not found or doesn't belong to user");
    }

    const wordCount = this.calculateWordCount(data.content);

    return this.coverLetterRepo.createCoverLetter({
      ...data,
      userId,
      wordCount,
    });
  }

  async getCoverLetters(
    userId: number,
    query: CoverLetterQuery,
  ): Promise<PaginatedCoverLetters> {
    return this.coverLetterRepo.getCoverLetters(userId, query);
  }

  async getCoverLetterById(
    userId: number,
    coverLetterId: number,
  ): Promise<CoverLetter | null> {
    return this.coverLetterRepo.getCoverLetterById(userId, coverLetterId);
  }

  async updateCoverLetter(
    userId: number,
    coverLetterId: number,
    data: CoverLetterUpdateData,
  ): Promise<CoverLetter | null> {
    const updateData: CoverLetterUpdate = { ...data };

    // Recalculate word count if content is updated
    if (data.content) {
      updateData.wordCount = this.calculateWordCount(data.content);
    }

    return this.coverLetterRepo.updateCoverLetter(
      userId,
      coverLetterId,
      updateData,
    );
  }

  async deleteCoverLetter(
    userId: number,
    coverLetterId: number,
  ): Promise<void> {
    return this.coverLetterRepo.deleteCoverLetter(userId, coverLetterId);
  }

  // ===== TEMPLATE GENERATION =====

  async generateFromTemplate(
    userId: number,
    data: GenerateFromTemplateData,
  ): Promise<CoverLetter> {
    const template = await this.getTemplateById(userId, data.templateId);
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    // Replace placeholders in template content
    let generatedContent = template.content;
    const placeholders = {
      "{{company}}": data.companyName,
      "{{position}}": data.position,
      "{{hiringManager}}": data.hiringManager || "Hiring Manager",
      ...data.customizations,
    };

    Object.entries(placeholders).forEach(([placeholder, value]) => {
      if (value) {
        generatedContent = generatedContent.replace(
          new RegExp(placeholder, "g"),
          value,
        );
      }
    });

    // Create the cover letter
    const coverLetterData: CoverLetterCreate = {
      cvId: data.cvId,
      templateId: data.templateId,
      applicationId: data.applicationId,
      title: `Cover Letter - ${data.companyName} - ${data.position}`,
      content: generatedContent,
      companyName: data.companyName,
      position: data.position,
      hiringManager: data.hiringManager,
      tone: template.tone || "professional",
    };

    return this.createCoverLetter(userId, coverLetterData);
  }

  // ===== ANALYTICS =====

  async getCoverLetterStats(userId: number): Promise<CoverLetterStats> {
    return this.coverLetterRepo.getCoverLetterStats(userId);
  }

  // ===== UTILITY METHODS =====

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  async duplicateCoverLetter(
    userId: number,
    coverLetterId: number,
  ): Promise<CoverLetter> {
    const original = await this.getCoverLetterById(userId, coverLetterId);
    if (!original) {
      throw new NotFoundError("Cover letter not found");
    }

    const duplicateData: CoverLetterCreate = {
      cvId: original.cvId,
      templateId: original.templateId || undefined,
      title: `${original.title} (Copy)`,
      content: original.content,
      companyName: original.companyName || undefined,
      position: original.position || undefined,
      hiringManager: original.hiringManager || undefined,
      tone: original.tone || "professional",
    };

    return this.createCoverLetter(userId, duplicateData);
  }
}
