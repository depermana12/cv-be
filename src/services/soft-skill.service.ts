import { BaseCrudService } from "./base.service";
import { softSkillRepository } from "./instance.repo";
import { softSkills } from "../db/schema/soft-skill.db";

export class SoftSkill extends BaseCrudService<typeof softSkills> {
  constructor(private readonly repo = softSkillRepository) {
    super(repo, "id");
  }
}
