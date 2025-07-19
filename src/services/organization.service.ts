import { CvChildService } from "./cvChild.service";
import type {
  OrganizationInsert,
  OrganizationQueryOptions,
  OrganizationSelect,
} from "../db/types/organization.type";
import { OrganizationRepository } from "../repositories/organization.repo";

export interface IOrganizationService {
  createOrganization(
    cvId: number,
    organizationData: Omit<OrganizationInsert, "cvId">,
  ): Promise<OrganizationSelect>;
  getOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationSelect>;
  getAllOrganizations(
    cvId: number,
    options?: OrganizationQueryOptions,
  ): Promise<OrganizationSelect[]>;
  updateOrganization(
    cvId: number,
    organizationId: number,
    updateData: Omit<OrganizationInsert, "cvId">,
  ): Promise<OrganizationSelect>;
  deleteOrganization(cvId: number, organizationId: number): Promise<boolean>;
}

export class OrganizationService
  extends CvChildService<OrganizationSelect, OrganizationInsert>
  implements IOrganizationService
{
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super(organizationRepository);
  }

  async createOrganization(
    cvId: number,
    organizationData: Omit<OrganizationInsert, "cvId">,
  ) {
    return this.createInCv(cvId, { ...organizationData, cvId });
  }

  async getOrganization(cvId: number, organizationId: number) {
    return this.getByIdInCv(cvId, organizationId);
  }

  async getAllOrganizations(cvId: number, options?: OrganizationQueryOptions) {
    return this.organizationRepository.getAllOrganizations(cvId, options);
  }

  async updateOrganization(
    cvId: number,
    organizationId: number,
    updateData: Omit<OrganizationInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, organizationId, updateData);
  }

  async deleteOrganization(cvId: number, organizationId: number) {
    return this.deleteInCv(cvId, organizationId);
  }
}
