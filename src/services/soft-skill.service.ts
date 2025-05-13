import { BaseCrudService } from "./base.service";
import { softSkillRepository } from "./instance.repo";
import {
  type SoftSkillInsert,
  type SoftSkillSelect,
} from "../db/types/soft-skill.type";

export class SoftSkillService extends BaseCrudService<
  SoftSkillSelect,
  SoftSkillInsert
> {
  constructor(private readonly repo = softSkillRepository) {
    super(repo);
  }
}
