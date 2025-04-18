import { personalRepository } from "./instance.repo";
import { NotFoundError } from "../errors/not-found.error";
import type { PersonalInsert, PersonalUpdate } from "../db/schema/personal.db";

export class Personal {
  private repo: typeof personalRepository;
  constructor(repository = personalRepository) {
    this.repo = repository;
  }

  async getAll() {
    return await this.repo.getAll();
  }

  async getById(id: number) {
    const personal = await this.repo.getById(id);

    if (!personal) {
      throw new NotFoundError(`cannot get: personal ID ${id} not found`);
    }
    return personal;
  }

  async create(data: PersonalInsert) {
    return this.repo.create(data);
  }

  async update(id: number, data: PersonalUpdate) {
    const existingPersonal = await this.repo.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot update: personal ID ${id} not found`);
    }
    return await this.repo.update(id, data);
  }

  async delete(id: number) {
    const existingPersonal = await this.repo.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot delete: personal ID ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
