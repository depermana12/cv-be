import { eq } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { projectTechnologies } from "../db/schema/project.db";
import type { ProjectTechStackInsert } from "../db/types/project.type";
import { getDb } from "../db";

const db = await getDb();
export class ProjectTechStack extends BaseRepository<
  typeof projectTechnologies,
  ProjectTechStackInsert
> {
  constructor() {
    super(projectTechnologies, db);
  }

  async getByProjectId(projectId: number) {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.projectId, projectId));
    return rows[0] ?? null;
  }

  async getByProjectIdGrouped() {
    const techs = await this.getAll();

    const grouped = techs.reduce((acc: Record<string, string[]>, tech) => {
      const key = tech.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tech.technology);
      return acc;
    }, {});

    return grouped;
  }

  async addTech(
    projectId: number,
    tech: Omit<ProjectTechStackInsert, "projectId">,
  ) {
    const inserted = await this.db
      .insert(this.table)
      .values({ ...tech, projectId })
      .$returningId();

    return this.getById(inserted[0].id);
  }

  async update(
    projectTechId: number,
    newProjectTech: Partial<ProjectTechStackInsert>,
  ) {
    await this.db
      .update(this.table)
      .set(newProjectTech)
      .where(eq(this.table.id, projectTechId));
    const updatedTech = await this.getById(projectTechId);
    if (!updatedTech) {
      throw new Error(`ProjectTech with ID ${projectTechId} not found`);
    }
    return updatedTech;
  }
}
