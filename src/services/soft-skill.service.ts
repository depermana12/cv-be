import { CvChildService } from "./cvChild.service";
import { SoftSkillRepository } from "../repositories/soft-skill.repo";
import {
  type SoftSkillInsert,
  type SoftSkillQueryOptions,
  type SoftSkillSelect,
  type SoftSkillUpdate,
} from "../db/types/soft-skill.type";

export class SoftSkillService extends CvChildService<
  SoftSkillSelect,
  SoftSkillInsert,
  SoftSkillUpdate
> {
  constructor(private readonly repo = new SoftSkillRepository()) {
    super(repo);
  }

  async createSoftSkill(
    cvId: number,
    softSkillData: Omit<SoftSkillInsert, "cvId">,
  ): Promise<SoftSkillSelect> {
    return this.createForCv(cvId, { ...softSkillData, cvId });
  }

  async getSoftSkill(
    cvId: number,
    softSkillId: number,
  ): Promise<SoftSkillSelect> {
    return this.findByCvId(cvId, softSkillId);
  }

  async getAllSoftSkills(
    cvId: number,
    options?: SoftSkillQueryOptions,
  ): Promise<SoftSkillSelect[]> {
    return this.repo.getAllSoftSkills(cvId, options);
  }

  async updateSoftSkill(
    cvId: number,
    softSkillId: number,
    newSoftSkillData: Omit<SoftSkillUpdate, "cvId">,
  ): Promise<SoftSkillSelect> {
    return this.updateForCv(cvId, softSkillId, newSoftSkillData);
  }

  async deleteSoftSkill(cvId: number, softSkillId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, softSkillId);
  }
}
