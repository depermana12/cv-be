import type {
  SkillInsert,
  SkillQueryOptions,
  SkillSelect,
} from "../db/types/skill.type";
import { CvChildService } from "./cvChild.service";
import { SkillRepository } from "../repositories/skill.repo";

export interface ISkillService {
  getUniqueCategories(cvId: number): Promise<string[]>;
  createSkill(
    cvId: number,
    skillData: Omit<SkillInsert, "cvId">,
  ): Promise<SkillSelect>;
  getSkill(cvId: number, skillId: number): Promise<SkillSelect>;
  getAllSkills(
    cvId: number,
    options?: SkillQueryOptions,
  ): Promise<SkillSelect[]>;
  updateSkill(
    cvId: number,
    skillId: number,
    newSkillData: Omit<SkillInsert, "cvId">,
  ): Promise<SkillSelect>;
  deleteSkill(cvId: number, skillId: number): Promise<boolean>;
}

export class SkillService
  extends CvChildService<SkillSelect, SkillInsert>
  implements ISkillService
{
  constructor(private readonly skillRepository: SkillRepository) {
    super(skillRepository);
  }

  async getUniqueCategories(cvId: number) {
    const categories = await this.skillRepository.getCategoriesForCv(cvId);
    return categories.map((row) => row.category);
  }

  async createSkill(cvId: number, skillData: Omit<SkillInsert, "cvId">) {
    return this.createInCv(cvId, { ...skillData, cvId });
  }

  async getSkill(cvId: number, skillId: number) {
    return this.getByIdInCv(cvId, skillId);
  }

  async getAllSkills(cvId: number, options?: SkillQueryOptions) {
    return this.skillRepository.getAllSkills(cvId, options);
  }

  async updateSkill(
    cvId: number,
    skillId: number,
    newSkillData: Omit<SkillInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, skillId, newSkillData);
  }

  async deleteSkill(cvId: number, skillId: number) {
    return this.deleteInCv(cvId, skillId);
  }
}
