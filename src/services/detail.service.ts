import type { BaseCrudRepository } from "../repositories/base.repo";
import { BaseCrudService } from "./base.service";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export interface DetailAdded<DS, DI, DU> {
  addDetail(detailId: number, newDetail: DI): Promise<{ id: number }>;
  getDetails(): Promise<DS[]>;
  getDetail(detailId: number): Promise<DS | null>;
  updateDetail(detailId: number, newDetail: DU): Promise<DS>;
  deleteDetail(detailId: number): Promise<void>;
}

export class DetailService<DS, DI, DU = Partial<DI>> extends BaseCrudService<
  DS,
  DI,
  DU
> {
  constructor(
    protected readonly repository: BaseCrudRepository<DS, DI, DU>,
    protected readonly detailRepo: DetailAdded<DS, DI, DU>,
  ) {
    super(repository);
  }
  async addDetail(id: number, newDetail: DI): Promise<{ id: number }> {
    return this.detailRepo.addDetail(id, newDetail);
  }
  async getDetails(): Promise<DS[]> {
    return this.detailRepo.getDetails();
  }
  async getDetail(detailId: number): Promise<DS> {
    const detailExists = await this.detailRepo.getDetail(detailId);
    if (!detailExists) {
      throw new NotFoundError(`Detail ${detailId} not found`);
    }
    return detailExists;
  }
  async updateDetail(detailId: number, newDetail: DU): Promise<DS> {
    return this.detailRepo.updateDetail(detailId, newDetail);
  }
  async deleteDetail(detailId: number): Promise<void> {
    this.detailRepo.deleteDetail(detailId);
  }
}
