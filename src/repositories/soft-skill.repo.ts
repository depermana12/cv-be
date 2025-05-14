import { BaseRepository } from "./base.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type { SoftSkillInsert } from "../db/types/soft-skill.type";

export class SoftSkillRepository extends BaseRepository<
  typeof softSkills,
  SoftSkillInsert
> {
  constructor() {
    super(softSkills);
  }
}
