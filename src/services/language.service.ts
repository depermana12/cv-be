import { LanguageRepository } from "../repositories/language.repo";
import { CvChildService } from "./cvChild.service";

import type {
  LanguageInsert,
  LanguageSelect,
  LanguageUpdate,
} from "../db/types/language.type";

export interface ILanguageService {
  updateLanguage(
    cvId: number,
    languageId: number,
    newLanguageData: LanguageUpdate,
  ): Promise<LanguageSelect>;
}

export class LanguageService
  extends CvChildService<LanguageSelect, LanguageInsert>
  implements ILanguageService
{
  constructor(private readonly languageRepository: LanguageRepository) {
    super(languageRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateLanguage(
    cvId: number,
    languageId: number,
    newLanguageData: LanguageUpdate,
  ) {
    return this.updateInCv(cvId, languageId, newLanguageData);
  }
}
