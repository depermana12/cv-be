import { BaseCrudService } from "./base.service";
import { skillRepository } from "./instance.repo";
import type { SkillInsert, SkillSelect } from "../db/types/skill.type";

export class SkillService extends BaseCrudService<SkillSelect, SkillInsert> {
  constructor(private readonly repo = skillRepository) {
    super(repo);
  }

  async getCategories() {
    return this.repo.getCategories;
  }
}
