import { BaseCrudService } from "./base.service";
import { languageRepository } from "./instance.repo";
import type { LanguageInsert, LanguageSelect } from "../db/types/language.type";

export class LanguageService extends BaseCrudService<
  LanguageSelect,
  LanguageInsert
> {
  constructor(private readonly repo = languageRepository) {
    super(repo);
  }

  async getAllByPersonalId(personalId: number) {
    return this.repo.getAllByPersonalId(personalId);
  }

  async createWithPersonalId(personalId: number, data: LanguageInsert) {
    return this.repo.createWithPersonalId(personalId, data);
  }
}
