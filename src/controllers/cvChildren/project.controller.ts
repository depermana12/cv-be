import { createHonoBindings } from "../../lib/create-hono";
import { zValidator } from "../../utils/validator";
import { projectService } from "../../lib/container";
import {
  createProjectSchema,
  updateProjectSchema,
  cvIdParamsSchema,
  projectParamsSchema,
} from "../../schemas/project.schema";

export const projectRoutes = createHonoBindings()
  .get("/:cvId/projects", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const projects = await projectService.getAll(cvId);

    return c.json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects,
    });
  })
  .get(
    "/:cvId/projects/:projectId",
    zValidator("param", projectParamsSchema),
    async (c) => {
      const { cvId, projectId } = c.req.valid("param");

      const project = await projectService.getOne(cvId, projectId);

      return c.json({
        success: true,
        message: "Project retrieved successfully",
        data: project,
      });
    },
  )
  .post(
    "/:cvId/projects",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createProjectSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const projectData = c.req.valid("json");

      const project = await projectService.create(cvId, projectData);

      return c.json(
        {
          success: true,
          message: "Project created successfully",
          data: project,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/projects/:projectId",
    zValidator("param", projectParamsSchema),
    zValidator("json", updateProjectSchema),
    async (c) => {
      const { cvId, projectId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const project = await projectService.update(
        cvId,
        projectId,
        updateData,
      );

      return c.json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    },
  )
  .delete(
    "/:cvId/projects/:projectId",
    zValidator("param", projectParamsSchema),
    async (c) => {
      const { cvId, projectId } = c.req.valid("param");

      const deleted = await projectService.delete(cvId, projectId);

      return c.json({
        success: true,
        message: "Project deleted successfully",
        data: deleted,
      });
    },
  );
