import { CvChildService } from "./cvChild.service";
import type {
  OrganizationDescInsert,
  OrganizationDescSelect,
  OrganizationDescUpdate,
  OrganizationInsert,
  OrganizationQueryOptions,
  OrganizationSelect,
  OrganizationUpdate,
  OrganizationResponse,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
} from "../db/types/organization.type";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";
import { OrganizationRepository } from "../repositories/organization.repo";

export class OrganizationService extends CvChildService<
  OrganizationSelect,
  OrganizationInsert,
  OrganizationUpdate
> {
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super(organizationRepository);
  }

  async getAllOrganizations(
    cvId: number,
    options?: OrganizationQueryOptions,
  ): Promise<OrganizationResponse[]> {
    return this.organizationRepository.getAllOrganizations(cvId, options);
  }

  async getOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationResponse> {
    const organization = await this.organizationRepository.getOrganization(
      organizationId,
    );
    if (!organization || organization.cvId !== cvId) {
      throw new NotFoundError(
        `Organization ${organizationId} not found for CV ${cvId}`,
      );
    }
    return organization;
  }

  async createOrganization(
    cvId: number,
    organizationData: OrganizationCreateRequest,
  ): Promise<OrganizationResponse> {
    const { descriptions = [], ...restOrganizationData } = organizationData;

    const result = await this.organizationRepository.createOrganization(
      { ...restOrganizationData, cvId },
      descriptions,
    );

    return this.getOrganization(cvId, result.id);
  }

  async updateOrganization(
    cvId: number,
    organizationId: number,
    updateData: OrganizationUpdateRequest,
  ): Promise<OrganizationResponse> {
    await this.getOrganization(cvId, organizationId);

    const { descriptions, ...organizationData } = updateData;
    await this.organizationRepository.updateOrganization(
      organizationId,
      organizationData,
      descriptions,
    );

    return this.getOrganization(cvId, organizationId);
  }

  async deleteOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<boolean> {
    await this.getOrganization(cvId, organizationId);
    return this.organizationRepository.deleteOrganization(organizationId);
  }

  async getAllDescriptions(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationDescSelect[]> {
    await this.getOrganization(cvId, organizationId);
    return this.organizationRepository.getAllDescriptions(organizationId);
  }

  async addDescription(
    cvId: number,
    organizationId: number,
    descriptionData: Omit<OrganizationDescInsert, "organizationId">,
  ): Promise<OrganizationDescSelect> {
    await this.getOrganization(cvId, organizationId);
    const result = await this.organizationRepository.addDescription(
      organizationId,
      descriptionData,
    );

    if (!result) {
      throw new BadRequestError(
        `Failed to add description to organization ${organizationId}`,
      );
    }

    return this.getDescription(cvId, result.id);
  }

  async getDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<OrganizationDescSelect> {
    const description = await this.organizationRepository.getDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    // Verify organization belongs to CV
    await this.getOrganization(cvId, description.organizationId);
    return description;
  }

  async updateDescription(
    cvId: number,
    descriptionId: number,
    updateData: OrganizationDescUpdate,
  ): Promise<OrganizationDescSelect> {
    const description = await this.organizationRepository.getDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.getOrganization(cvId, description.organizationId);

    const updated = await this.organizationRepository.updateDescription(
      descriptionId,
      updateData,
    );
    if (!updated) {
      throw new BadRequestError(
        `Failed to update description ${descriptionId}`,
      );
    }

    return this.getDescription(cvId, descriptionId);
  }

  async deleteDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.organizationRepository.getDescription(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }

    await this.getOrganization(cvId, description.organizationId);
    return this.organizationRepository.deleteDescription(descriptionId);
  }
}
