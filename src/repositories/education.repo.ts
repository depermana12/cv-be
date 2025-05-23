import { CvChildRepository } from "./cvChild.repo";
import { educations } from "../db/schema/education.db";
import type {
  EducationSelect,
  EducationInsert,
  EducationUpdate,
} from "../db/types/education.type";
import { getDb } from "../db";

const db = await getDb();
export class EducationRepository extends CvChildRepository<
  typeof educations,
  EducationInsert,
  EducationSelect,
  EducationUpdate
> {
  constructor() {
    super(educations, db);
  }
}
