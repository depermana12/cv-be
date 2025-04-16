import { BaseCrudService } from "./base.service";
import { projectTechStackRepository } from "./instance.repo";
import { projectTechnologies } from "../db/schema/project.db";
import type { ProjectTechStackInsert } from "../db/schema/project.db";
import { NotFoundError } from "../errors/not-found.error";

export class ProjectTechStack extends BaseCrudService<
  typeof projectTechnologies
> {
  constructor() {
    super(projectTechStackRepository, "id");
  }

  async getByProjectId(projectId: number) {
    const record = await projectTechStackRepository.getByProjectId(projectId);
    if (!record) {
      throw new NotFoundError(
        `cannot get: detail ${this.primaryKey} ${projectId} not found`,
      );
    }
    return record;
  }

  async getByProjectIdGrouped() {
    return projectTechStackRepository.getByProjectIdGrouped();
  }

  async addTech(
    projectId: number,
    tech: Omit<ProjectTechStackInsert, "projectId">,
  ) {
    return projectTechStackRepository.addTech(projectId, tech);
  }
}
