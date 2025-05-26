import { CvChildService } from "./cvChild.service";
import { ProjectRepository } from "../repositories/project.repo";

import type {
  ProjectDescInsert,
  ProjectDescSelect,
  ProjectInsert,
  ProjectQueryOptions,
  ProjectSelect,
  ProjectTechStackInsert,
  ProjectTechStackSelect,
  ProjectUpdate,
  ProjectWithDescAndTechStackInsert,
  ProjectWithDescAndTechStackUpdate,
  ProjectWithDescriptions,
  ProjectWithDescriptionsAndTechStack,
} from "../db/types/project.type";
import { NotFoundError } from "../errors/not-found.error";
import { BadRequestError } from "../errors/bad-request.error";

export class ProjectService extends CvChildService<
  ProjectSelect,
  ProjectInsert,
  ProjectUpdate
> {
  constructor(private readonly repo = new ProjectRepository()) {
    super(repo);
  }

  // ---------------------
  // Project Core CRUD Operations
  // ---------------------

  async createProject(
    cvId: number,
    projectData: Omit<ProjectInsert, "cvId">,
  ): Promise<ProjectSelect> {
    return this.createForCv(cvId, { ...projectData, cvId });
  }

  async getProject(cvId: number, projectId: number): Promise<ProjectSelect> {
    return this.findByCvId(cvId, projectId);
  }

  async getAllProjects(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectSelect[]> {
    return this.repo.getAllProjects(cvId, options);
  }

  async updateProject(
    cvId: number,
    projectId: number,
    newProjectData: Omit<ProjectUpdate, "cvId">,
  ): Promise<ProjectSelect> {
    return this.updateForCv(cvId, projectId, newProjectData);
  }

  async deleteProject(cvId: number, projectId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, projectId);
  }

  /**
   * Utility function that asserts that a project is owned by a specific CV.
   * @param cvId The ID of the CV.
   * @param projectId The ID of the project.
   * @returns The project if it is owned by the CV.
   * @throws NotFoundError if the project does not exist or does not belong to the CV.
   */
  private async assertProjectOwnedByCv(
    cvId: number,
    projectId: number,
  ): Promise<ProjectSelect> {
    return this.findByCvId(cvId, projectId);
  }

  // ---------------------
  // Project Description CRUD Operations
  // ---------------------

  async addProjectDescription(
    cvId: number,
    projectId: number,
    descriptionData: ProjectDescInsert,
  ): Promise<ProjectDescInsert> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    const description = await this.repo.createDescription(
      project.id,
      descriptionData,
    );
    if (!description) {
      throw new NotFoundError(
        `[Service] failed to create description for project: ${projectId} in CV: ${cvId}`,
      );
    }
    return this.getProjectDescription(cvId, description.id);
  }

  async getProjectDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<ProjectDescSelect> {
    const description = await this.repo.getDescriptionById(descriptionId);
    if (!description) {
      throw new NotFoundError(
        `[Service] description not found with id: ${descriptionId} in CV: ${cvId}`,
      );
    }
    await this.assertProjectOwnedByCv(cvId, description.projectId);
    return description;
  }

  async getAllProjectDescriptions(
    cvId: number,
    projectId: number,
  ): Promise<ProjectDescSelect[]> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    return this.repo.getAllDescriptions(project.id);
  }

  async updateProjectDescription(
    cvId: number,
    descriptionId: number,
    newDescriptionData: ProjectDescInsert,
  ): Promise<ProjectDescSelect> {
    const description = await this.getProjectDescription(cvId, descriptionId);
    if (!description) {
      throw new NotFoundError(
        `[Service] description not found with id: ${descriptionId} in CV: ${cvId}`,
      );
    }
    const updatedDescription = await this.repo.updateDescription(
      description.id,
      newDescriptionData,
    );
    if (!updatedDescription) {
      throw new NotFoundError(
        `[Service] failed to update description with id: ${descriptionId} in CV: ${cvId}`,
      );
    }
    return this.getProjectDescription(cvId, descriptionId);
  }

  async deleteProjectDescription(
    cvId: number,
    descriptionId: number,
  ): Promise<boolean> {
    const description = await this.getProjectDescription(cvId, descriptionId);
    if (!description) {
      throw new NotFoundError(
        `[Service] description not found with id: ${descriptionId} in CV: ${cvId}`,
      );
    }

    const deleted = await this.repo.deleteDescription(description.id);
    if (!deleted) {
      throw new NotFoundError(
        `[Service] failed to delete description with id: ${descriptionId} in CV: ${cvId}`,
      );
    }
    return deleted;
  }

  // ---------------------
  // Project technology CRUD Operations
  // ---------------------

  async addProjectTechnology(
    cvId: number,
    projectId: number,
    technologyData: ProjectTechStackInsert,
  ): Promise<ProjectTechStackInsert> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    const technology = await this.repo.addOneTechnology(
      project.id,
      technologyData,
    );
    if (!technology) {
      throw new NotFoundError(
        `[Service] failed to create technology for project: ${projectId} in CV: ${cvId}`,
      );
    }
    return this.getProjectTechnology(cvId, technology.id);
  }

  async getProjectTechnology(
    cvId: number,
    technologyId: number,
  ): Promise<ProjectTechStackSelect> {
    const technology = await this.repo.getTechnologyById(cvId, technologyId);
    if (!technology) {
      throw new NotFoundError(
        `[Service] technology not found with id: ${technologyId} in CV: ${cvId}`,
      );
    }
    return technology;
  }

  async getAllProjectTechnologies(
    cvId: number,
    projectId: number,
  ): Promise<ProjectTechStackSelect[]> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    return this.repo.getAllTechnologies(project.id);
  }

  async updateProjectTechnology(
    cvId: number,
    technologyId: number,
    newTechnologyData: ProjectTechStackInsert,
  ): Promise<ProjectTechStackSelect> {
    const technology = await this.getProjectTechnology(cvId, technologyId);

    await this.assertProjectOwnedByCv(cvId, technology.projectId);

    const updatedTechnology = await this.repo.updateOneTechnology(
      technology.projectId,
      technologyId,
      newTechnologyData,
    );
    if (!updatedTechnology) {
      throw new NotFoundError(
        `[Service] failed to update technology with id: ${technologyId} in CV: ${cvId}`,
      );
    }
    return this.getProjectTechnology(cvId, technologyId);
  }

  async deleteProjectTechnology(
    cvId: number,
    technologyId: number,
  ): Promise<boolean> {
    const technology = await this.getProjectTechnology(cvId, technologyId);
    await this.assertProjectOwnedByCv(cvId, technology.projectId);

    const deleted = await this.repo.deleteTechnology(technology.id);
    if (!deleted) {
      throw new NotFoundError(
        `[Service] failed to delete technology with id: ${technologyId} in CV: ${cvId}`,
      );
    }
    return deleted;
  }

  /**
   * Create a project with multiple descriptions.
   * @param cvId The ID of the CV.
   * @param projectData The data for the project to be created.
   * @param descriptionData An array of descriptions to be associated with the project.
   * @returns A composite object containing the created project and its descriptions.
   */
  async createProjectWithDescription(
    cvId: number,
    projectData: Omit<ProjectInsert, "cvId">,
    descriptionData: ProjectDescInsert[],
  ): Promise<ProjectWithDescriptions> {
    const { id } = await this.repo.createProjectWithDescriptions(
      { ...projectData, cvId },
      descriptionData,
    );

    const projectWithDescriptions = await this.repo.getProjectWithDescriptions(
      id,
    );
    if (!projectWithDescriptions) {
      throw new NotFoundError(
        `[Service] project with id ${id} not found after creation`,
      );
    }
    return projectWithDescriptions;
  }

  /**
   * Get all projects with their descriptions for a specific CV.
   * @param cvId The ID of the CV.
   * @param options Optional query options for filtering, sorting, etc.
   * @param options.search Optional search term to filter project names.
   * @param options.sortBy Optional sorting options. (e.g., by name, date)
   * @param options.sortOrder Optional sorting order (asc or desc).
   * @returns An array of projects with their descriptions.
   */
  async getAllProjectsWithDescriptions(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectWithDescriptions[]> {
    return this.repo.getAllProjectsWithDescriptions(cvId, options);
  }

  async deleteProjectWithDescriptions(
    cvId: number,
    projectId: number,
  ): Promise<boolean> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    const deleted = await this.repo.deleteProjectWithDescriptions(project.id);
    if (!deleted) {
      throw new BadRequestError(
        `[Service] failed to delete project with id: ${projectId} in CV: ${cvId}`,
      );
    }
    return deleted;
  }

  /**
   * For Project: createProjectFull mean bulk with project, descriptions, and technologies.
   * @param cvId The ID of the CV.
   * @param insertData The data for the project, descriptions, and technologies.
   * @param insertData.project The project data to be inserted.
   * @param insertData.descriptions An array of descriptions to be associated with the project.
   * @param insertData.technologies An array of technologies to be associated with the project.
   * @returns A composite object containing the created project, its descriptions, and technologies.
   */
  async createProjectFull(
    cvId: number,
    insertData: ProjectWithDescAndTechStackInsert,
  ): Promise<ProjectWithDescriptionsAndTechStack> {
    const { project, descriptions, technologies } = insertData;

    const { id } = await this.repo.createProjectFull(
      { ...project, cvId },
      descriptions,
      technologies,
    );

    const projectWithDescAndTechStack = await this.repo.getProjectFullByCvId(
      id,
    );
    if (!projectWithDescAndTechStack) {
      throw new NotFoundError(
        `[Service] project with id ${id} not found after creation`,
      );
    }
    return projectWithDescAndTechStack;
  }

  /**
   * Get a project with its descriptions and technologies by CV ID.
   * @param projectId The ID of the project.
   * @description Retrieves a project with its descriptions and technologies by CV ID.
   * @returns A composite object containing the project, its descriptions, and technologies.
   */
  async getProjectFullByCvId(
    projectId: number,
  ): Promise<ProjectWithDescriptionsAndTechStack> {
    const project = await this.repo.getProjectFullByCvId(projectId);
    if (!project) {
      throw new NotFoundError(
        `[Service] project with id ${projectId} not found`,
      );
    }
    return project;
  }

  /**
   * Get all projects with their descriptions and technologies for a specific CV.
   * @param cvId The ID of the CV.
   * @param projectId The ID of the project.
   * @description Retrieves all projects with their descriptions and technologies for a specific CV.
   * @returns An array of projects with their descriptions and technologies.
   */
  async getAllProjectsFullByCvId(
    cvId: number,
    options?: ProjectQueryOptions,
  ): Promise<ProjectWithDescriptionsAndTechStack[]> {
    return this.repo.getAllProjectsFullByCvId(cvId, options);
  }

  /**
   * Bulk update optional project with its descriptions and technologies.
   * @param cvId The ID of the CV.
   * @param projectId The ID of the project to be updated.
   * @param updateData The data to update the project, descriptions, and technologies.
   * @param updateData.project The project data to be updated.
   * @param updateData.descriptions An array of descriptions to be updated.
   * @param updateData.technologies An array of technologies to be updated.
   * @description Updates a project with its descriptions and technologies.
   * @returns A composite object containing the updated project, its descriptions, and technologies.
   */
  async updateProjectFull(
    cvId: number,
    projectId: number,
    updateData: ProjectWithDescAndTechStackUpdate,
  ): Promise<ProjectWithDescriptionsAndTechStack> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    const updatedProject = await this.repo.updateProjectFull(
      project.id,
      updateData,
    );
    if (!updatedProject) {
      throw new NotFoundError(
        `[Service] failed to update project with id: ${projectId} in CV: ${cvId}`,
      );
    }
    return this.getProjectFullByCvId(project.id);
  }

  /**
   * Delete a project with its descriptions and technologies.
   * @param cvId The ID of the CV.
   * @param projectId The ID of the project to be deleted.
   * @description Deletes a project with its descriptions and technologies.
   * @returns A boolean indicating success or failure.
   */
  async deleteProjectFull(cvId: number, projectId: number): Promise<boolean> {
    const project = await this.assertProjectOwnedByCv(cvId, projectId);
    const deleted = await this.repo.deleteProjectFull(project.id);
    if (!deleted) {
      throw new BadRequestError(
        `[Service] failed to delete project with id: ${projectId} in CV: ${cvId}`,
      );
    }
    return deleted;
  }
}
