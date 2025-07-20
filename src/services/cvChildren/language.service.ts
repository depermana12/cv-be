import { CvChildService } from "../cvChild.service";
import type {
  LanguageInsert,
  LanguageSelect,
} from "../../db/types/language.type";
import { LanguageRepository } from "../../repositories/cvChildren/language.repo";

export class LanguageService extends CvChildService<
  LanguageSelect,
  LanguageInsert
> {
  constructor(private readonly languageRepository: LanguageRepository) {
    super(languageRepository);
  }
}
