import { CvChildRepository } from "./cvChild.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type { SoftSkillInsert } from "../db/types/soft-skill.type";
import { getDb } from "../db";

const db = await getDb();
export class SoftSkillRepository extends CvChildRepository<
  typeof softSkills,
  SoftSkillInsert
> {
  constructor() {
    super(softSkills, db);
  }
}
