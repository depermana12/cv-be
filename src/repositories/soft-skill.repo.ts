import { BaseRepository } from "./base.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type { SoftSkillInsert } from "../db/types/soft-skill.type";
import { db } from "../db/index";

export class SoftSkillRepository extends BaseRepository<
  typeof softSkills,
  SoftSkillInsert
> {
  constructor() {
    super(db, softSkills);
  }
}
