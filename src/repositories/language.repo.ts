import { CvChildRepository } from "./cvChild.repo";
import { languages } from "../db/schema/language.db";
import type {
  LanguageInsert,
  LanguageSelect,
  LanguageUpdate,
} from "../db/types/language.type";
import { getDb } from "../db";

const db = await getDb();
export class LanguageRepository extends CvChildRepository<
  typeof languages,
  LanguageInsert,
  LanguageSelect,
  LanguageUpdate
> {
  constructor() {
    super(languages, db);
  }
}
