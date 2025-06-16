import { CvChildService } from "./cvChild.service";
import { ProjectRepository } from "../repositories/project.repo";

import type {
  ProjectDescInsert,
  ProjectDescSelect,
  ProjectFullInsert,
  ProjectFullSelect,
  ProjectFullUpdate,
  ProjectInsert,
  ProjectQueryOptions,
  ProjectSelect,
  ProjectUpdate,
} from "../db/types/project.type";
import { NotFoundError } from "../errors/not-found.error";
import { ProjectTechService } from "./project-tech.service";

export class ProjectService extends CvChildService<
  ProjectSelect,
  ProjectInsert,
  ProjectUpdate
> {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectTechService: ProjectTechService,
  ) {
    super(projectRepository);
  }

  async getAllProjects(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectFullSelect[]> {
    return this.projectRepository.getAllProjects(cvId, options);
  }

  async getProject(
    cvId: number,
    projectId: number,
  ): Promise<ProjectFullSelect> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project || project.cvId !== cvId) {
      throw new NotFoundError(`Project ${projectId} not found for CV ${cvId}`);
    }
    return project;
  }

  async createProject(
    cvId: number,
    projectData: ProjectFullInsert,
  ): Promise<ProjectFullSelect> {
    const {
      descriptions = [],
      technologies = [],
      ...restProjectData
    } = projectData;
    const result = await this.projectRepository.createProject(
      { ...restProjectData, cvId },
      descriptions,
      technologies,
    );

    return this.getProject(cvId, result.id);
  }
  async updateProject(
    cvId: number,
    projectId: number,
    updateData: ProjectFullUpdate,
  ): Promise<ProjectFullSelect> {
    await this.getProject(cvId, projectId);
    const { descriptions, technologies, ...projectData } = updateData;
    await this.projectRepository.updateProject(
      projectId,
      projectData,
      descriptions,
      technologies,
    );

    return this.getProject(cvId, projectId);
  }

  async deleteProject(cvId: number, projectId: number): Promise<boolean> {
    await this.getProject(cvId, projectId);
    return this.projectRepository.deleteProject(projectId);
  }

  async getDescriptions(
    cvId: number,
    projectId: number,
  ): Promise<ProjectDescSelect[]> {
    await this.getProject(cvId, projectId);
    return this.projectRepository.getDescriptions(projectId);
  }

  async getDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<ProjectDescSelect> {
    const description = await this.projectRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }
    await this.getProject(cvId, description.projectId);
    return description;
  }

  async addDescription(
    cvId: number,
    projectId: number,
    description: { description: string },
  ) {
    await this.getProject(cvId, projectId);
    return this.projectRepository.addDescription(projectId, description);
  }

  async updateDescription(
    cvId: number,
    descriptionId: number,
    updateData: Partial<Omit<ProjectDescInsert, "id" | "projectId">>,
  ): Promise<ProjectDescSelect> {
    const description = await this.projectRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }
    await this.getProject(cvId, description.projectId);

    const updated = await this.projectRepository.updateDescription(
      descriptionId,
      updateData,
    );
    if (!updated) {
      throw new Error(`Failed to update description ${descriptionId}`);
    }
    return this.getDescription(cvId, descriptionId);
  }

  async deleteDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.projectRepository.getDescriptionById(
      descriptionId,
    );
    if (!description) {
      throw new NotFoundError(`Description ${descriptionId} not found`);
    }
    await this.getProject(cvId, description.projectId);
    return this.projectRepository.deleteDescription(descriptionId);
  }

  async addTechnology(
    cvId: number,
    projectId: number,
    technology: { category: string; technology: string },
  ) {
    await this.getProject(cvId, projectId);
    return this.projectRepository.addTechnology(projectId, technology);
  }
}
