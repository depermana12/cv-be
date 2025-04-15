import type {
  EducationInsert,
  EducationUpdate,
} from "../db/schema/education.db";
import { educationRepository } from "./instance.repo";

export class Education {
  async getAll() {
    try {
      return await educationRepository.getAll();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async getById(educationId: number) {
    try {
      return await educationRepository.getById(educationId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async create(eduData: EducationInsert) {
    try {
      return await educationRepository.create(eduData);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async update(educationId: number, newEduData: Partial<EducationUpdate>) {
    try {
      return await educationRepository.update(educationId, newEduData);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  async delete(educationId: number) {
    try {
      return await educationRepository.delete(educationId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
