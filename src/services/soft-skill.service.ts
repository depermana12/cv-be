import { BaseCrudService } from "./base.service";
import { softSkillRepository } from "./instance.repo";
import {
  softSkills,
  type SoftSkillInsert,
  type SoftSkillSelect,
} from "../db/schema/soft-skill.db";

export class SoftSkill extends BaseCrudService<
  typeof softSkills,
  SoftSkillSelect,
  SoftSkillInsert
> {
  constructor(private readonly repo = softSkillRepository) {
    super(repo, "id");
  }
}
