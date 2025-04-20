import { BaseCrudService } from "./base.service";
import { skillRepository } from "./instance.repo";
import { type SkillInsert, type SkillSelect } from "../db/schema/skill.db";

export class SkillService extends BaseCrudService<SkillSelect, SkillInsert> {
  constructor(private readonly repo = skillRepository) {
    super(repo);
  }

  async getCategories() {
    return this.repo.getCategories;
  }
}
