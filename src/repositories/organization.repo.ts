import { eq } from "drizzle-orm";

import { CvChildRepository } from "./cvChild.repo";
import { organizations, organizationDesc } from "../db/schema/organization.db";
import type {
  OrganizationInsert,
  OrganizationDescInsert,
  OrganizationSelect,
  OrganizationUpdate,
} from "../db/types/organization.type";
import { getDb } from "../db";

const db = await getDb();
export class OrganizationRepository extends CvChildRepository<
  typeof organizations,
  OrganizationInsert,
  OrganizationSelect,
  OrganizationUpdate
> {
  constructor() {
    super(organizations, db);
  }

  async getByIdWithDescriptions(id: number) {
    return this.db.query.organizations.findFirst({
      where: eq(organizations.id, id),
      with: {
        descriptions: true,
      },
    });
  }

  async getAllByIdWithDescriptions(cvId: number) {
    return this.db.query.organizations.findMany({
      where: eq(organizations.cvId, cvId),
      with: {
        descriptions: true,
      },
    });
  }

  async createOrganizationWithDescriptions(
    organizationData: OrganizationInsert,
    descriptions: OrganizationDescInsert[],
  ) {
    return this.db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizations)
        .values(organizationData)
        .$returningId();

      if (descriptions.length > 0) {
        await tx.insert(organizationDesc).values(
          descriptions.map((desc) => ({
            ...desc,
            organizationId: organization.id,
          })),
        );
      }
      return organization.id;
    });
  }

  async deleteOrgWithDescriptions(id: number) {
    return this.db.transaction(async (tx) => {
      await tx
        .delete(organizationDesc)
        .where(eq(organizationDesc.organizationId, id));
      const [result] = await tx
        .delete(organizations)
        .where(eq(organizations.id, id));

      return result.affectedRows > 0;
    });
  }

  async createDescription(
    organizationId: number,
    description: OrganizationDescInsert,
  ) {
    const [desc] = await this.db
      .insert(organizationDesc)
      .values({ ...description, organizationId })
      .$returningId();

    return desc.id;
  }

  async getDescriptionById(descId: number) {
    const [result] = await this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.organizationId, descId));

    return result ?? null;
  }

  async getAllDescriptions(organizationId: number) {
    return this.db
      .select()
      .from(organizationDesc)
      .where(eq(organizationDesc.organizationId, organizationId));
  }

  async updateDescription(
    descId: number,
    newDescription: Partial<OrganizationDescInsert>,
  ) {
    const [result] = await this.db
      .update(organizationDesc)
      .set(newDescription)
      .where(eq(organizationDesc.id, descId));

    return result.affectedRows > 0;
  }

  async deleteDescription(descId: number) {
    const [result] = await this.db
      .delete(organizationDesc)
      .where(eq(organizationDesc.id, descId));

    return result.affectedRows > 0;
  }
}
