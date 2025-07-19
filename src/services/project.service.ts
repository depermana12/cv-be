import type {
  ProjectInsert,
  ProjectQueryOptions,
  ProjectSelect,
} from "../db/types/project.type";
import { CvChildService } from "./cvChild.service";
import { ProjectRepository } from "../repositories/project.repo";

export interface IProjectService {
  createProject(
    cvId: number,
    projectData: Omit<ProjectInsert, "cvId">,
  ): Promise<ProjectSelect>;
  getProject(cvId: number, projectId: number): Promise<ProjectSelect>;
  getAllProjects(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectSelect[]>;
  updateProject(
    cvId: number,
    projectId: number,
    updateData: Omit<ProjectInsert, "cvId">,
  ): Promise<ProjectSelect>;
  deleteProject(cvId: number, projectId: number): Promise<boolean>;
}

export class ProjectService
  extends CvChildService<ProjectSelect, ProjectInsert>
  implements IProjectService
{
  constructor(private readonly projectRepository: ProjectRepository) {
    super(projectRepository);
  }

  async createProject(
    cvId: number,
    projectData: Omit<ProjectInsert, "cvId">,
  ): Promise<ProjectSelect> {
    return this.createInCv(cvId, { ...projectData, cvId });
  }

  async getProject(cvId: number, projectId: number): Promise<ProjectSelect> {
    return this.getByIdInCv(cvId, projectId);
  }

  async getAllProjects(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectSelect[]> {
    return this.projectRepository.getAllProjects(cvId, options);
  }

  async updateProject(
    cvId: number,
    projectId: number,
    updateData: Omit<ProjectInsert, "cvId">,
  ): Promise<ProjectSelect> {
    return this.updateInCv(cvId, projectId, updateData);
  }

  async deleteProject(cvId: number, projectId: number): Promise<boolean> {
    return this.deleteInCv(cvId, projectId);
  }
}
