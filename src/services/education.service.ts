import { CvChildService } from "./cvChild.service";
import type { EducationRepository } from "../repositories/education.repo";
import type {
  EducationInsert,
  EducationSelect,
} from "../db/types/education.type";

export class EducationService extends CvChildService<
  EducationSelect,
  EducationInsert
> {
  constructor(private readonly educationRepository: EducationRepository) {
    super(educationRepository);
  }
}
