import type {
  ProjectInsert,
  ProjectSelect,
  ProjectUpdate,
} from "../db/types/project.type";
import { CvChildService } from "./cvChild.service";
import { ProjectRepository } from "../repositories/project.repo";

export interface IProjectService {
  updateProject(
    cvId: number,
    projectId: number,
    updateData: ProjectUpdate,
  ): Promise<ProjectSelect>;
}

export class ProjectService
  extends CvChildService<ProjectSelect, ProjectInsert>
  implements IProjectService
{
  constructor(private readonly projectRepository: ProjectRepository) {
    super(projectRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateProject(
    cvId: number,
    projectId: number,
    updateData: ProjectUpdate,
  ) {
    return this.updateInCv(cvId, projectId, updateData);
  }
}
