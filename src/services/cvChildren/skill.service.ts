import { CvChildService } from "../cvChild.service";
import type { SkillInsert, SkillSelect } from "../../db/types/skill.type";
import { SkillRepository } from "../../repositories/cvChildren/skill.repo";

export class SkillService extends CvChildService<SkillSelect, SkillInsert> {
  constructor(private readonly skillRepository: SkillRepository) {
    super(skillRepository);
  }
}
