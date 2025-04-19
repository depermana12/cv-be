import { BaseCrudService } from "./base.service";
import { skillRepository } from "./instance.repo";
import {
  skills,
  type SkillInsert,
  type SkillSelect,
} from "../db/schema/skill.db";

export class Skill extends BaseCrudService<
  typeof skills,
  SkillSelect,
  SkillInsert
> {
  constructor(private readonly repo = skillRepository) {
    super(repo, "id");
  }

  async getCategories() {
    return this.repo.getCategories;
  }
}
