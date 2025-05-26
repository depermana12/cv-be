import { CvChildService } from "./cvChild.service";
import type {
  OrganizationDescInsert,
  OrganizationDescSelect,
  OrganizationDescUpdate,
  OrganizationInsert,
  OrganizationQueryOptions,
  OrganizationSelect,
  OrganizationUpdate,
  OrganizationWithDescriptions,
} from "../db/types/organization.type";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";
import { OrganizationRepository } from "../repositories/organization.repo";

export class OrganizationService extends CvChildService<
  OrganizationSelect,
  OrganizationInsert,
  OrganizationUpdate
> {
  constructor(private readonly repo = new OrganizationRepository()) {
    super(repo);
  }

  // ---------------------
  // Organization Core CRUD operations
  // ---------------------

  async createOrganization(
    cvId: number,
    descriptionData: Omit<OrganizationInsert, "cvId">,
  ): Promise<OrganizationSelect> {
    return this.createForCv(cvId, { ...descriptionData, cvId });
  }

  async getOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationSelect> {
    return this.findByCvId(cvId, organizationId);
  }

  async getAllOrganizations(cvId: number): Promise<OrganizationSelect[]> {
    return this.findAllByCvId(cvId);
  }

  async updateOrganization(
    cvId: number,
    organizationId: number,
    newOrganizationData: OrganizationUpdate,
  ): Promise<OrganizationSelect> {
    return this.updateForCv(cvId, organizationId, newOrganizationData);
  }

  async deleteOrganization(
    cvId: number,
    organizationId: number,
  ): Promise<boolean> {
    return this.deleteFromCv(cvId, organizationId);
  }

  /**
   * Utility function that asserts that the organization belongs to the specified CV.
   * @param cvId - The ID of the CV.
   * @param organizationId - The ID of the organization.
   * @returns The organization if it exists and belongs to the CV.
   * @throws NotFoundError if the organization does not exist or does not belong to the CV.
   */
  private async assertOrgOwnedByCv(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationSelect> {
    return this.findByCvId(cvId, organizationId);
  }

  // ---------------------
  // Organization Description CRUD operations
  // ---------------------

  async createOrgDescription(
    cvId: number,
    organizationId: number,
    descriptionData: OrganizationDescInsert,
  ): Promise<OrganizationDescInsert> {
    await this.assertOrgOwnedByCv(cvId, organizationId);

    const description = await this.repo.createDescription(
      organizationId,
      descriptionData,
    );

    if (!description) {
      throw new BadRequestError(
        `[Service] failed to create description for organization: ${organizationId}`,
      );
    }

    return this.getOrgDescription(cvId, description.id);
  }

  async getOrgDescription(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationDescSelect> {
    const description = await this.repo.getDescriptionById(organizationId);
    if (!description) {
      throw new NotFoundError(
        `[Service] Description ${organizationId} not found for CV: ${cvId}`,
      );
    }
    await this.assertOrgOwnedByCv(cvId, description.organizationId);
    return description;
  }

  async getAllOrgDescriptions(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationDescSelect[]> {
    await this.assertOrgOwnedByCv(cvId, organizationId);
    const descriptions = await this.repo.getAllDescriptions(organizationId);

    return descriptions;
  }

  async updateOrgDescription(
    cvId: number,
    descriptionId: number,
    newDescriptionData: OrganizationDescUpdate,
  ): Promise<OrganizationDescSelect> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(
        `[Service] Description with id ${descriptionId} not found`,
      );
    }

    await this.assertOrgOwnedByCv(cvId, descriptionId);

    const updatedDescription = await this.repo.updateDescription(
      descriptionId,
      newDescriptionData,
    );
    if (!updatedDescription) {
      throw new BadRequestError(
        `[Service] Failed to update description with id: ${descriptionId}`,
      );
    }
    return this.getOrgDescription(cvId, descriptionId);
  }

  async deleteOrgDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(
        `[Service] Description with id ${descriptionId} not found`,
      );
    }

    await this.assertOrgOwnedByCv(cvId, description.organizationId);

    const deleted = await this.repo.deleteDescription(descriptionId);
    if (!deleted) {
      throw new BadRequestError(
        `[Service] Failed to delete description with id: ${descriptionId} for CV: ${cvId}`,
      );
    }
    return deleted;
  }

  // ---------------------
  // Bulk operations for organizations with descriptions
  // ---------------------

  /**
   * Bulk operations for organizations with descriptions.
   * @param cvId - The ID of the CV to which the organization belongs.
   * @param organizationData - The organization data to be created.
   * @param descriptionData - An array of descriptions to be associated with the organization.
   * @return A composite object containing the organization and its descriptions.
   */
  async createOrgWithDescription(
    cvId: number,
    organizationData: Omit<OrganizationInsert, "cvId">,
    descriptionData: OrganizationDescInsert[],
  ): Promise<OrganizationSelect & { descriptions: OrganizationDescInsert[] }> {
    const { id } = await this.repo.createOrganizationWithDescriptions(
      { ...organizationData, cvId },
      descriptionData,
    );

    return this.getOrgWithDescriptions(cvId, id);
  }

  async getOrgWithDescriptions(
    cvId: number,
    organizationId: number,
  ): Promise<OrganizationWithDescriptions> {
    const organization = await this.assertOrgOwnedByCv(cvId, organizationId);

    const orgWithDescriptions = await this.repo.getOrgWithDescriptions(
      organization.id,
    );
    if (!orgWithDescriptions) {
      throw new NotFoundError(
        `[Service] Organization ${organization.id} found but failed to retrieve with descriptions.`,
      );
    }
    return orgWithDescriptions;
  }

  /**
   * Retrieves all organizations with their descriptions for a given CV.
   * @param cvId - The ID of the CV to which the organizations belong.
   * @param options - Optional query options for filtering and sorting.
   * @param options.search - Optional search term to filter organizations by name or description.
   * @param options.sortBy - Optional field to sort organizations by (e.g., 'name').
   * @param options.sortOrder - Optional sort order ('asc' or 'desc').
   * @returns An array of organizations with their descriptions.
   */
  async getAllOrgWithDescriptions(
    cvId: number,
    options?: OrganizationQueryOptions,
  ): Promise<OrganizationWithDescriptions[]> {
    return this.repo.getAllByIdWithDescriptions(cvId, options);
  }

  async deleteOrgWithDescriptions(
    cvId: number,
    organizationId: number,
  ): Promise<boolean> {
    await this.assertOrgOwnedByCv(cvId, organizationId);
    const deleted = await this.repo.deleteOrgWithDescriptions(organizationId);
    if (!deleted) {
      throw new BadRequestError(
        `[Service] Failed to delete organization with id: ${organizationId} for CV: ${cvId}`,
      );
    }
    return deleted;
  }
}
