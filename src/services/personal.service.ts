import { personalRepository } from "./instance.repo";
import { NotFoundError } from "../errors/not-found.error";
import type {
  PersonalSelect,
  PersonalInsert,
  PersonalUpdate,
} from "../db/schema/personal.db";
import { BadRequestError } from "../errors/bad-request.error";

export class Personal {
  private repo: typeof personalRepository;
  constructor(private readonly repository = personalRepository) {
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
    const record = this.repo.create(data);
    if (!record) {
      throw new BadRequestError("failed to create the record.");
    }
    return record;
  }

  async update(id: number, data: PersonalUpdate) {
    const existingPersonal = await this.repo.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot update: personal ID ${id} not found`);
    }
    const updated = await this.repo.update(id, data);
    if (!updated) {
      throw new BadRequestError(`failed to update: ID ${id}`);
    }
    return updated;
  }

  async delete(id: number) {
    const existingPersonal = await this.repo.getById(id);
    if (!existingPersonal) {
      throw new NotFoundError(`cannot delete: personal ID ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
