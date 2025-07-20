import { CvChildService } from "../cvChild.service";
import type {
  EducationInsert,
  EducationSelect,
} from "../../db/types/education.type";
import { EducationRepository } from "../../repositories/cvChildren/education.repo";

export class EducationService extends CvChildService<
  EducationSelect,
  EducationInsert
> {
  constructor(private readonly educationRepository: EducationRepository) {
    super(educationRepository);
  }
}
