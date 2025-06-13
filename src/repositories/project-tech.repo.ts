import { CvChildRepository } from "./cvChild.repo";
import { projectTechnologies } from "../db/schema/project.db";
import type {
  ProjectTechInsert,
  ProjectTechSelect,
  ProjectTechUpdate,
} from "../db/types/project.type";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import type { ProjectTechQueryOptions } from "../db/types/project-tech.type";
import type { Database } from "../db/index";
export class ProjectTechRepository extends CvChildRepository<
  typeof projectTechnologies,
  ProjectTechInsert,
  ProjectTechSelect,
  ProjectTechUpdate
> {
  constructor(db: Database) {
    super(projectTechnologies, db);
  }

  async addTechnology(
    projectId: number,
    technology: Omit<ProjectTechInsert, "projectId">,
  ): Promise<{ id: number }> {
    const [result] = await this.db
      .insert(projectTechnologies)
      .values({ ...technology, projectId })
      .$returningId();
    return { id: result.id };
  }

  async addTechnologies(
    projectId: number,
    technologies: ProjectTechInsert[],
  ): Promise<{ id: number }[]> {
    if (technologies.length === 0) return [];
    const results = await this.db
      .insert(projectTechnologies)
      .values(technologies.map((tech) => ({ ...tech, projectId })))
      .$returningId();
    return results.map((r) => ({ id: r.id }));
  }

  async getAllTechnologies(
    projectId: number,
    options?: ProjectTechQueryOptions,
  ): Promise<ProjectTechSelect[]> {
    const whereClause = [eq(projectTechnologies.projectId, projectId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(
        like(sql`lower(${projectTechnologies.technology})`, searchTerm),
      );
    }

    return this.db.query.projectTechnologies.findMany({
      where: and(...whereClause),
      orderBy: options?.sortBy
        ? [
            options.sortOrder === "asc"
              ? asc(projectTechnologies[options.sortBy])
              : desc(projectTechnologies[options.sortBy]),
          ]
        : [],
    });
  }

  async getTechnologyById(
    projectId: number,
    techId: number,
  ): Promise<ProjectTechSelect | null> {
    const [result] = await this.db
      .select()
      .from(projectTechnologies)
      .where(
        and(
          eq(projectTechnologies.projectId, projectId),
          eq(projectTechnologies.id, techId),
        ),
      );
    return result ?? null;
  }

  async updateTechnology(
    projectId: number,
    techId: number,
    newTechnology: ProjectTechUpdate,
  ): Promise<boolean> {
    const [result] = await this.db
      .update(projectTechnologies)
      .set(newTechnology)
      .where(
        and(
          eq(projectTechnologies.projectId, projectId),
          eq(projectTechnologies.id, techId),
        ),
      );
    return result.affectedRows > 0;
  }

  async updateManyTechnologies(
    projectId: number,
    technologies: ProjectTechInsert[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.projectId, projectId));
      if (technologies.length > 0) {
        await tx
          .insert(projectTechnologies)
          .values(technologies.map((tech) => ({ ...tech, projectId })));
      }
    });
  }

  async deleteTechnology(projectId: number, techId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(projectTechnologies)
      .where(
        and(
          eq(projectTechnologies.projectId, projectId),
          eq(projectTechnologies.id, techId),
        ),
      );
    return result.affectedRows > 0;
  }

  async deleteAllTechnologies(projectId: number): Promise<boolean> {
    const [result] = await this.db
      .delete(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));
    return result.affectedRows > 0;
  }
}
