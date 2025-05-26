import { LanguageRepository } from "../repositories/language.repo";
import { CvChildService } from "./cvChild.service";

import type {
  LanguageInsert,
  LanguageQueryOptions,
  LanguageSelect,
  LanguageUpdate,
} from "../db/types/language.type";

export class LanguageService extends CvChildService<
  LanguageSelect,
  LanguageInsert,
  LanguageUpdate
> {
  constructor(private readonly repo = new LanguageRepository()) {
    super(repo);
  }

  async createLanguage(
    cvId: number,
    languageData: Omit<LanguageInsert, "cvId">,
  ): Promise<LanguageSelect> {
    return this.createForCv(cvId, { ...languageData, cvId });
  }

  async getLanguage(cvId: number, languageId: number): Promise<LanguageSelect> {
    return this.findByCvId(cvId, languageId);
  }

  async getAllLanguages(
    cvId: number,
    options?: LanguageQueryOptions,
  ): Promise<LanguageSelect[]> {
    return this.repo.getAllLanguages(cvId, options);
  }

  async updateLanguage(
    cvId: number,
    languageId: number,
    newLanguageData: LanguageUpdate,
  ): Promise<LanguageSelect> {
    return this.updateForCv(cvId, languageId, newLanguageData);
  }

  async deleteLanguage(cvId: number, languageId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, languageId);
  }
}
