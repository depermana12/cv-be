import { BaseCrudService } from "./base.service";
import { educationRepository } from "./instance.repo";
import { education } from "../db/schema/education.db";

export class Education extends BaseCrudService<typeof education> {
  constructor() {
    super(educationRepository, "id");
  }
}
