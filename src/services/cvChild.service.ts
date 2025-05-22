import { BaseCrudService } from "./base.service";
import type { CvChildRepository } from "../repositories/cvChild.repo";

export abstract class CvChildService<
  TSelect,
  TInsert,
  TUpdate = Partial<TInsert>,
> extends BaseCrudService<TSelect, TInsert, TUpdate> {
  constructor(
    protected readonly repository: CvChildRepository<
      any,
      TInsert,
      TSelect,
      TUpdate
    >,
  ) {
    super(repository);
  }

  async getAllByCvId(cvId: number): Promise<TSelect[]> {
    return this.repository.getAllByIdInCv(cvId);
  }

  async getByIdInCv(cvId: number, id: number): Promise<TSelect> {
    return await this.repository.getByIdInCv(cvId, id);
  }

  async updateInCv(cvId: number, id: number, data: TUpdate): Promise<TSelect> {
    return await this.repository.updateInCv(cvId, id, data);
  }

  async deleteInCv(cvId: number, id: number): Promise<void> {
    return await this.repository.deleteByIdInCv(cvId, id);
  }

  async existsInCv(cvId: number, id: number): Promise<boolean> {
    return await this.repository.existsInCv(cvId, id);
  }
}
