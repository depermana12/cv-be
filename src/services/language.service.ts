import { LanguageRepository } from "../repositories/language.repo";
import { CvChildService } from "./cvChild.service";

import type { LanguageInsert, LanguageSelect } from "../db/types/language.type";

export class LanguageService extends CvChildService<
  LanguageSelect,
  LanguageInsert
> {
  constructor(private readonly languageRepository: LanguageRepository) {
    super(languageRepository);
  }
}
