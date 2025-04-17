import { BaseCrudService } from "./base.service";
import { skillRepository } from "./instance.repo";
import { skills } from "../db/schema/skill.db";

export class Skill extends BaseCrudService<typeof skills> {
  constructor(private readonly repo = skillRepository) {
    super(repo, "id");
  }

  async getCategories() {
    return this.repo.getCategories;
  }
}
