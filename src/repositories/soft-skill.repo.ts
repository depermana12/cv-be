import { BaseRepository } from "./base.repo";
import { softSkills } from "../db/schema/soft-skill.db";

export class SoftSkillRepository extends BaseRepository<typeof softSkills> {
  constructor() {
    super(softSkills, "id");
  }
}
