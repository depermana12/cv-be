import { BaseCrudService } from "./base.service";
import { projectTechStackRepository } from "./instance.repo";
import { projectTechnologies } from "../db/schema/project.db";
import type { ProjectTechStackInsert } from "../db/schema/project.db";

export class ProjectTechStack extends BaseCrudService<
  typeof projectTechnologies
> {
  constructor() {
    super(projectTechStackRepository, "id");
  }

  async getByProjectId(projectId: number) {
    return projectTechStackRepository.getByProjectId(projectId);
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
