import { BaseCrudService } from "./base.service";
import { softSkillRepository } from "./instance.repo";
import {
  type SoftSkillInsert,
  type SoftSkillSelect,
} from "../db/schema/soft-skill.db";

export class SoftSkillService extends BaseCrudService<
  SoftSkillSelect,
  SoftSkillInsert
> {
  constructor(private readonly repo = softSkillRepository) {
    super(repo);
  }
}
