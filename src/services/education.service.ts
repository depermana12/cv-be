import { BaseCrudService } from "./base.service";
import { educationRepository } from "./instance.repo";
import {
  education,
  type EducationInsert,
  type EducationSelect,
} from "../db/schema/education.db";

export class Education extends BaseCrudService<
  typeof education,
  EducationSelect,
  EducationInsert
> {
  constructor(private readonly repo = educationRepository) {
    super(repo, "id");
  }
}
