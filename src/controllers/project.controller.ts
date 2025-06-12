import { zValidator } from "../utils/validator";
import { ProjectService } from "../services/project.service";
import { ProjectTechService } from "../services/project-tech.service";
import {
  projectInsertSchema,
  projectUpdateSchema,
  projectDescInsertSchema,
  projectDescUpdateSchema,
  projectTechInsertSchema,
  projectTechUpdateSchema,
  projectInsertWithDescSchema,
  projectInsertWithDescAndTechSchema,
  projectUpdateWithDescAndTechSchema,
  projectQueryOptionsSchema,
  projectTechQueryOptionsSchema,
} from "../schemas/project.schema";
import { ProjectRepository } from "../repositories/project.repo";
import { ProjectTechRepository } from "../repositories/project-tech.repo";
import { createHonoBindings } from "../lib/create-hono";

const projectRepository = new ProjectRepository();
const projectTechRepository = new ProjectTechRepository();
const projectTechService = new ProjectTechService(projectTechRepository);
const projectService = new ProjectService(
  projectRepository,
  projectTechService,
);

export const projectRoutes = createHonoBindings()
  .get(
    "/:cvId/projects",
    zValidator("query", projectQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const projects = await projectService.getAllProjects(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${projects.length} project records successfully`,
        data: projects,
      });
    },
  )
  .get(
    "/:cvId/projects-with-descriptions",
    zValidator("query", projectQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const projectsWithDesc =
        await projectService.getAllProjectsWithDescriptions(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${projectsWithDesc.length} project records with descriptions successfully`,
        data: projectsWithDesc,
      });
    },
  )
  // Get all projects with descriptions and technologies (full) for a CV
  .get(
    "/:cvId/projects-full",
    zValidator("query", projectQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const projectsFull = await projectService.getAllProjectsFullByCvId(
        cvId,
        options,
      );

      return c.json({
        success: true,
        message: `retrieved ${projectsFull.length} full project records successfully`,
        data: projectsFull,
      });
    },
  )
  // Get a specific project
  .get("/:cvId/projects/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    const project = await projectService.getProject(cvId, projectId);

    return c.json({
      success: true,
      message: `project record ${projectId} retrieved successfully`,
      data: project,
    });
  })
  // Get a project with full details (descriptions and technologies)
  .get("/:cvId/projects-full/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    // Verify ownership first
    await projectService.getProject(cvId, projectId);
    const projectFull = await projectService.getProjectFullByCvId(projectId);

    return c.json({
      success: true,
      message: `full project record ${projectId} retrieved successfully`,
      data: projectFull,
    });
  })
  // Create a simple project
  .post(
    "/:cvId/projects",
    zValidator("json", projectInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectData = c.req.valid("json");

      const newProject = await projectService.createProject(cvId, projectData);

      return c.json(
        {
          success: true,
          message: `project record created with ID: ${newProject.id}`,
          data: newProject,
        },
        201,
      );
    },
  )
  // Create project with descriptions
  .post(
    "/:cvId/projects-with-descriptions",
    zValidator("json", projectInsertWithDescSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const { descriptions = [], ...projectData } = c.req.valid("json");

      const newProjectWithDesc =
        await projectService.createProjectWithDescription(
          cvId,
          projectData,
          descriptions,
        );

      return c.json(
        {
          success: true,
          message: `project with descriptions created with ID: ${newProjectWithDesc.id}`,
          data: newProjectWithDesc,
        },
        201,
      );
    },
  )
  // Create project with descriptions and technologies (full)
  .post(
    "/:cvId/projects-full",
    zValidator("json", projectInsertWithDescAndTechSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const {
        descriptions = [],
        technologies = [],
        ...projectData
      } = c.req.valid("json");

      const newProjectFull = await projectService.createProjectFull(cvId, {
        project: projectData,
        descriptions,
        technologies,
      });

      return c.json(
        {
          success: true,
          message: `full project record created with ID: ${newProjectFull.id}`,
          data: newProjectFull,
        },
        201,
      );
    },
  )
  // Update a project
  .patch(
    "/:cvId/projects/:projectId",
    zValidator("json", projectUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const updateData = c.req.valid("json");

      const updatedProject = await projectService.updateProject(
        cvId,
        projectId,
        updateData,
      );

      return c.json({
        success: true,
        message: `project record ${projectId} updated successfully`,
        data: updatedProject,
      });
    },
  )
  // Update project with descriptions and technologies (full)
  .patch(
    "/:cvId/projects-full/:projectId",
    zValidator("json", projectUpdateWithDescAndTechSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const updateData = c.req.valid("json");

      const updatedProjectFull = await projectService.updateProjectFull(
        cvId,
        projectId,
        updateData,
      );

      return c.json({
        success: true,
        message: `full project record ${projectId} updated successfully`,
        data: updatedProjectFull,
      });
    },
  )
  // Delete a project
  .delete("/:cvId/projects/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    await projectService.deleteProject(cvId, projectId);

    return c.json({
      success: true,
      message: `project record ${projectId} deleted successfully`,
    });
  })
  // Delete project with descriptions
  .delete("/:cvId/projects-with-descriptions/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    await projectService.deleteProjectWithDescriptions(cvId, projectId);

    return c.json({
      success: true,
      message: `project record ${projectId} with descriptions deleted successfully`,
    });
  })
  // Delete project with all related data (full)
  .delete("/:cvId/projects-full/:projectId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    await projectService.deleteProjectFull(cvId, projectId);

    return c.json({
      success: true,
      message: `full project record ${projectId} deleted successfully`,
    });
  })
  // Get all descriptions for a project
  .get("/:cvId/projects/:projectId/descriptions", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));

    const descriptions = await projectService.getAllProjectDescriptions(
      cvId,
      projectId,
    );

    return c.json({
      success: true,
      message: `retrieved ${descriptions.length} description records for project ${projectId}`,
      data: descriptions,
    });
  })
  // Get a specific description
  .get("/:cvId/projects/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    const description = await projectService.getProjectDescription(
      cvId,
      descriptionId,
    );

    return c.json({
      success: true,
      message: `description record ${descriptionId} retrieved successfully`,
      data: description,
    });
  })
  // Create a description for a project
  .post(
    "/:cvId/projects/:projectId/descriptions",
    zValidator("json", projectDescInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const descriptionData = c.req.valid("json");

      const newDescription = await projectService.addProjectDescription(
        cvId,
        projectId,
        descriptionData,
      );

      return c.json(
        {
          success: true,
          message: `description created with ID: ${newDescription.id} for project ${projectId}`,
          data: newDescription,
        },
        201,
      );
    },
  )
  // Update a description
  .patch(
    "/:cvId/projects/descriptions/:descriptionId",
    zValidator("json", projectDescUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const descriptionId = Number(c.req.param("descriptionId"));
      const updateData = c.req.valid("json");

      const updatedDescription = await projectService.updateProjectDescription(
        cvId,
        descriptionId,
        updateData,
      );

      return c.json({
        success: true,
        message: `description record ${descriptionId} updated successfully`,
        data: updatedDescription,
      });
    },
  )
  // Delete a description
  .delete("/:cvId/projects/descriptions/:descriptionId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const descriptionId = Number(c.req.param("descriptionId"));

    await projectService.deleteProjectDescription(cvId, descriptionId);

    return c.json({
      success: true,
      message: `description record ${descriptionId} deleted successfully`,
    });
  })
  // Get all technologies for a project
  .get(
    "/:cvId/projects/:projectId/technologies",
    zValidator("query", projectTechQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      // const options = c.req.valid("query");

      const technologies = await projectService.getAllProjectTechnologies(
        cvId,
        projectId,
      );

      return c.json({
        success: true,
        message: `retrieved ${technologies.length} technology records for project ${projectId}`,
        data: technologies,
      });
    },
  )
  // Get a specific technology
  .get("/:cvId/projects/:projectId/technologies/:technologyId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const projectId = Number(c.req.param("projectId"));
    const technologyId = Number(c.req.param("technologyId"));

    const technology = await projectService.getProjectTechnology(
      cvId,
      projectId,
      technologyId,
    );

    return c.json({
      success: true,
      message: `technology record ${technologyId} retrieved successfully`,
      data: technology,
    });
  })
  // Create a technology for a project
  .post(
    "/:cvId/projects/:projectId/technologies",
    zValidator("json", projectTechInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const technologyData = c.req.valid("json");

      const newTechnology = await projectService.addProjectTechnology(
        cvId,
        projectId,
        technologyData,
      );

      return c.json(
        {
          success: true,
          message: `technology created with ID: ${newTechnology.id} for project ${projectId}`,
          data: newTechnology,
        },
        201,
      );
    },
  )
  // Update a technology
  .patch(
    "/:cvId/projects/:projectId/technologies/:technologyId",
    zValidator("json", projectTechUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const technologyId = Number(c.req.param("technologyId"));
      const updateData = c.req.valid("json");

      const updatedTechnology = await projectService.updateProjectTechnology(
        cvId,
        projectId,
        technologyId,
        updateData,
      );

      return c.json({
        success: true,
        message: `technology record ${technologyId} updated successfully`,
        data: updatedTechnology,
      });
    },
  )
  // Delete a technology
  .delete(
    "/:cvId/projects/:projectId/technologies/:technologyId",
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const projectId = Number(c.req.param("projectId"));
      const technologyId = Number(c.req.param("technologyId"));

      await projectService.deleteProjectTechnology(
        cvId,
        projectId,
        technologyId,
      );

      return c.json({
        success: true,
        message: `technology record ${technologyId} deleted successfully`,
      });
    },
  );
