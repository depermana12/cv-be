import type {
  SkillInsert,
  SkillSelect,
  SkillUpdate,
} from "../db/types/skill.type";
import { CvChildService } from "./cvChild.service";
import { SkillRepository } from "../repositories/skill.repo";

export interface ISkillService {
  getUniqueCategories(cvId: number): Promise<string[]>;
  updateSkill(
    cvId: number,
    skillId: number,
    newSkillData: SkillUpdate,
  ): Promise<SkillSelect>;
}

export class SkillService
  extends CvChildService<SkillSelect, SkillInsert>
  implements ISkillService
{
  constructor(private readonly skillRepository: SkillRepository) {
    super(skillRepository);
  }

  // Custom method: gets unique categories for the CV
  async getUniqueCategories(cvId: number) {
    const categories = await this.skillRepository.getCategoriesForCv(cvId);
    return categories.map((row) => row.category);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateSkill(cvId: number, skillId: number, newSkillData: SkillUpdate) {
    return this.updateInCv(cvId, skillId, newSkillData);
  }
}
