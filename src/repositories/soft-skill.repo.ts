import { BaseRepository } from "./base.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type { SoftSkillInsert } from "../db/types/soft-skill.type";
import { getDb } from "../db";

const db = await getDb();
export class SoftSkillRepository extends BaseRepository<
  typeof softSkills,
  SoftSkillInsert
> {
  constructor() {
    super(softSkills, db);
  }
}
