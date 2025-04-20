import { BaseCrudService } from "./base.service";
import { educationRepository } from "./instance.repo";
import {
  type EducationInsert,
  type EducationSelect,
} from "../db/schema/education.db";

export class EducationService extends BaseCrudService<
  EducationSelect,
  EducationInsert
> {
  constructor(private readonly repo = educationRepository) {
    super(repo);
  }
}
