import { CvChildRepository } from "../cvChild.repo";
import { skills } from "../../db/schema/skill.db";
import type { SkillInsert, SkillSelect } from "../../db/types/skill.type";
import type { Database } from "../../db/index";

export class SkillRepository extends CvChildRepository<
  typeof skills,
  SkillInsert,
  SkillSelect,
  "id"
> {
  constructor(db: Database) {
    super(skills, db, "id");
  }
}
