import { BaseCrudService } from "./base.service";
import { skillRepository } from "./instance.repo";
import { skills } from "../db/schema/skill.db";

export class Skill extends BaseCrudService<typeof skills> {
  constructor() {
    super(skillRepository, "id");
  }

  async getCategories() {
    return skillRepository.getCategories();
  }
}
