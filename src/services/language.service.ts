import { BaseCrudService } from "./base.service";
import { languageRepository } from "./instance.repo";
import { language } from "../db/schema/language.db";
import type { LanguageInsert } from "../db/schema/language.db";

export class Language extends BaseCrudService<typeof language> {
  constructor() {
    super(languageRepository, "id");
  }

  async getAllByPersonalId(personalId: number) {
    return languageRepository.getAllByPersonalId(personalId);
  }

  async createWithPersonalId(personalId: number, data: LanguageInsert) {
    return this.create({ ...data, personalId });
  }
}
