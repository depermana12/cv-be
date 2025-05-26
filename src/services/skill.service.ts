import { CvChildService } from "./cvChild.service";
import { SkillRepository } from "../repositories/skill.repo";

import type {
  SkillInsert,
  SkillQueryOptions,
  SkillSelect,
  SkillUpdate,
} from "../db/types/skill.type";

export class SkillService extends CvChildService<
  SkillSelect,
  SkillInsert,
  SkillUpdate
> {
  constructor(private readonly repo = new SkillRepository()) {
    super(repo);
  }

  async getUniqueCategories() {
    return this.repo.getCategories();
  }

  async createSkill(
    cvId: number,
    skillData: Omit<SkillInsert, "cvId">,
  ): Promise<SkillSelect> {
    return this.createForCv(cvId, { ...skillData, cvId });
  }

  async getSkill(cvId: number, skillId: number): Promise<SkillSelect> {
    return this.findByCvId(cvId, skillId);
  }

  async getAllSkills(
    cvId: number,
    options?: SkillQueryOptions,
  ): Promise<SkillSelect[]> {
    return this.repo.getAllSkills(cvId, options);
  }

  async updateSkill(
    cvId: number,
    skillId: number,
    newSkillData: Omit<SkillUpdate, "cvId">,
  ): Promise<SkillSelect> {
    return this.updateForCv(cvId, skillId, newSkillData);
  }

  async deleteSkill(cvId: number, skillId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, skillId);
  }
}
