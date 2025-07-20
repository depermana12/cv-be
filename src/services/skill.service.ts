import type { SkillInsert, SkillSelect } from "../db/types/skill.type";
import { CvChildService } from "./cvChild.service";
import { SkillRepository } from "../repositories/skill.repo";

export interface ISkillService {
  getUniqueCategories(cvId: number): Promise<string[]>;
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
}
