import { CvChildRepository } from "./cvChild.repo";
import { softSkills } from "../db/schema/soft-skill.db";
import type {
  SoftSkillInsert,
  SoftSkillSelect,
  SoftSkillUpdate,
} from "../db/types/soft-skill.type";
import { getDb } from "../db";

const db = await getDb();
export class SoftSkillRepository extends CvChildRepository<
  typeof softSkills,
  SoftSkillInsert,
  SoftSkillSelect,
  SoftSkillUpdate
> {
  constructor() {
    super(softSkills, db);
  }
}
