import { language } from "../db/schema/language.db";
import { BaseRepository } from "../repositories/base.repo";
import { BaseService } from "./base.service";

export const langRepository = new BaseRepository(language, "id");

export class LangService extends BaseService<typeof language> {
  constructor() {
    super(langRepository);
  }
}
