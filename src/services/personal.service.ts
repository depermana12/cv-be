import type { PersonalInsert, PersonalUpdate } from "../db/schema/personal.db";
import { personalRepository } from "./instance.repo";

export class Personal {
  async getAll() {
    try {
      return await personalRepository.getAll();
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(id: number) {
    try {
      return await personalRepository.getById(id);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(data: PersonalInsert) {
    try {
      return await personalRepository.create(data);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(personalId: number, data: PersonalUpdate) {
    try {
      return await personalRepository.update(personalId, data);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(personalId: number) {
    try {
      return await personalRepository.delete(personalId);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
