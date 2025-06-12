import { CvChildService } from "./cvChild.service";
import { ProjectTechRepository } from "../repositories/project-tech.repo";
import { NotFoundError } from "../errors/not-found.error";
import type {
  ProjectTechSelect,
  ProjectTechInsert,
  ProjectTechUpdate,
} from "../db/types/project.type";

export class ProjectTechService extends CvChildService<
  ProjectTechSelect,
  ProjectTechInsert,
  ProjectTechUpdate
> {
  constructor(private readonly projectTechRepository: ProjectTechRepository) {
    super(projectTechRepository);
  }

  async addTechnology(
    projectId: number,
    technologyData: Omit<ProjectTechInsert, "projectId">,
  ): Promise<ProjectTechSelect> {
    const created = await this.projectTechRepository.addTechnology(
      projectId,
      technologyData,
    );
    if (!created)
      throw new NotFoundError(`[ProjectTechService] Failed to add technology`);
    return this.getTechnologyById(projectId, created.id);
  }

  async getTechnologyById(
    projectId: number,
    techId: number,
  ): Promise<ProjectTechSelect> {
    const tech = await this.projectTechRepository.getTechnologyById(
      projectId,
      techId,
    );
    if (!tech)
      throw new NotFoundError(
        `[ProjectTechService] Technology with id: ${techId} not found`,
      );
    return tech;
  }

  async getAllTechnologies(projectId: number): Promise<ProjectTechSelect[]> {
    return this.projectTechRepository.getAllTechnologies(projectId);
  }

  async updateTechnology(
    projectId: number,
    techId: number,
    newTechData: ProjectTechUpdate,
  ): Promise<ProjectTechSelect> {
    const updated = await this.projectTechRepository.updateTechnology(
      projectId,
      techId,
      newTechData,
    );
    if (!updated)
      throw new NotFoundError(
        `[ProjectTechService] Failed to update technology with id: ${techId} not found`,
      );
    return this.getTechnologyById(projectId, techId);
  }

  async deleteTechnology(projectId: number, techId: number): Promise<boolean> {
    const deleted = await this.projectTechRepository.deleteTechnology(
      projectId,
      techId,
    );
    if (!deleted)
      throw new NotFoundError(
        `[ProjectTechService] Failed to delete technology with id: ${techId} not found`,
      );
    return deleted;
  }
}
