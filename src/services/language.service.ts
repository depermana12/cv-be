import { LanguageRepository } from "../repositories/language.repo";
import { CvChildService } from "./cvChild.service";

import type {
  LanguageInsert,
  LanguageQueryOptions,
  LanguageSelect,
} from "../db/types/language.type";

export class LanguageService extends CvChildService<
  LanguageSelect,
  LanguageInsert
> {
  constructor(private readonly languageRepository: LanguageRepository) {
    super(languageRepository);
  }

  async createLanguage(
    cvId: number,
    languageData: Omit<LanguageInsert, "cvId">,
  ): Promise<LanguageSelect> {
    return this.createInCv(cvId, { ...languageData, cvId });
  }

  async getLanguage(cvId: number, languageId: number): Promise<LanguageSelect> {
    return this.getByIdInCv(cvId, languageId);
  }

  async getAllLanguages(
    cvId: number,
    options?: LanguageQueryOptions,
  ): Promise<LanguageSelect[]> {
    return this.languageRepository.getAllLanguages(cvId, options);
  }

  async updateLanguage(
    cvId: number,
    languageId: number,
    newLanguageData: Omit<LanguageInsert, "cvId">,
  ): Promise<LanguageSelect> {
    return this.updateInCv(cvId, languageId, newLanguageData);
  }

  async deleteLanguage(cvId: number, languageId: number): Promise<boolean> {
    return this.deleteInCv(cvId, languageId);
  }
}
