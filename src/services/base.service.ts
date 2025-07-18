import { type BaseCrudRepository } from "../repositories/base.repo";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export interface IBaseCrudService<TS, TI> {
  getAll(): Promise<TS[]>;
  getById(id: number): Promise<TS>;
  create(data: TI): Promise<TS>;
  update(id: number, data: Partial<TI>): Promise<TS>;
  delete(id: number): Promise<boolean>;
}
export class BaseCrudService<TS, TI> implements IBaseCrudService<TS, TI> {
  constructor(protected readonly repository: BaseCrudRepository<TS, TI>) {}

  async getAll(): Promise<TS[]> {
    return this.repository.getAll();
  }

  async getById(id: number): Promise<TS> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new NotFoundError(`[Service] cannot get: ${id} not found`);
    }
    return result;
  }

  async create(data: TI): Promise<TS> {
    const result = await this.repository.create(data);
    if (!result) {
      throw new BadRequestError("Failed to create record");
    }
    return result;
  }

  async update(id: number, data: Partial<TI>): Promise<TS> {
    const exists = await this.repository.getById(id);
    if (!exists) {
      throw new NotFoundError(`Record with id ${id} not found`);
    }

    const result = await this.repository.update(id, data);
    if (!result) {
      throw new BadRequestError(`Failed to update record with id ${id}`);
    }
    return result;
  }

  async delete(id: number): Promise<boolean> {
    const exists = await this.repository.getById(id);
    if (!exists) {
      throw new NotFoundError(`Record with id ${id} not found`);
    }

    const result = await this.repository.delete(id);
    if (!result) {
      throw new BadRequestError(`Failed to delete record with id ${id}`);
    }
    return result;
  }
}
