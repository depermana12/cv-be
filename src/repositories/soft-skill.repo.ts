import { BaseRepository } from "./base.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type {
  SoftSkillInsert,
  SoftSkillSelect,
} from "../db/schema/soft-skill.db";
import { db } from "../db/index";

export class SoftSkillRepository extends BaseRepository<
  typeof softSkills,
  SoftSkillSelect,
  SoftSkillInsert
> {
  constructor() {
    super(db, softSkills, "id");
  }
}
