import { personalRepository } from "./instance.repo";
import { NotFoundError } from "../errors/not-found.error";
import type { PersonalInsert, PersonalUpdate } from "../db/schema/personal.db";

export class Personal {
  async getAll() {
    return await personalRepository.getAll();
  }

  async getById(id: number) {
    const personal = await personalRepository.getById(id);

    if (!personal) {
      throw new NotFoundError(`cannot get: personal ID ${id} not found`);
    }
    return personal;
  }

  async create(data: PersonalInsert) {
    return personalRepository.create(data);
  }

  async update(id: number, data: PersonalUpdate) {
    const existingPersonal = await personalRepository.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot update: personal ID ${id} not found`);
    }
    return await personalRepository.update(id, data);
  }

  async delete(id: number) {
    const existingPersonal = await personalRepository.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot delete: personal ID ${id} not found`);
    }
    return await personalRepository.delete(id);
  }
}
