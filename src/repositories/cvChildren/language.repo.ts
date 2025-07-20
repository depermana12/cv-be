import { CvChildRepository } from "../cvChild.repo";
import { languages } from "../../db/schema/language.db";
import type { LanguageInsert, LanguageSelect } from "../../db/types/language.type";
import type { Database } from "../../db/index";

export class LanguageRepository extends CvChildRepository<
  typeof languages,
  LanguageInsert,
  LanguageSelect,
  "id"
> {
  constructor(db: Database) {
    super(languages, db, "id");
  }
}
