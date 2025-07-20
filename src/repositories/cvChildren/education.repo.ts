import { CvChildRepository } from "../cvChild.repo";
import { educations } from "../../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
} from "../../db/types/education.type";
import type { Database } from "../../db";

export class EducationRepository extends CvChildRepository<
  typeof educations,
  EducationInsert,
  EducationSelect,
  "id"
> {
  constructor(db: Database) {
    super(educations, db, "id");
  }
}
