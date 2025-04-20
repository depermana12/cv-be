import { Hono } from "hono";
import { zValidator } from "../utils/validator";

import { ProjectService } from "../services/project.service";
import { ProjectTechStackService } from "../services/project-tech.service";
import {
  projectCreateSchema,
  projectUpdateSchema,
  projectDetailCreateSchema,
  projectDetailUpdateSchema,
  projectTechnologyCreateSchema,
  projectTechnologyUpdateSchema,
} from "../schemas/project.schema";

const projectService = new ProjectService();
const projectTechStackService = new ProjectTechStackService();
export const projectRoutes = new Hono()
  .get("/", async (c) => {
    const data = await projectService.getAll();
    return c.json({
      message: `retrieved ${data.length} records successfully`,
      data,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const project = await projectService.getById(id);
    return c.json({
      success: true,
      message: `record ID: ${id} retrieved successfully`,
      data: project,
    });
  })
  .post("/", zValidator("json", projectCreateSchema), async (c) => {
    const validated = c.req.valid("json");
    const newProject = await projectService.create(validated);
    return c.json(
      {
        message: `new record created with ID: ${newProject.id}`,
        data: newProject,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", projectUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validated = c.req.valid("json");

    const updated = await projectService.update(id, validated);
    return c.json({
      success: true,
      message: `record ID: ${id} updated successfully`,
      data: updated,
    });
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await projectService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  })
  .get("/:id/details", async (c) => {
    const id = Number(c.req.param("id"));

    const details = await projectService.getDetailById(id);
    return c.json({
      success: true,
      message: "success get project details",
      data: details,
    });
  })
  .get("/:id/details/:detailId", async (c) => {
    const id = Number(c.req.param("id"));
    const detailId = Number(c.req.param("detailId"));

    const detail = await projectService.getDetailById(detailId);

    if (detail.id !== id) {
      return c.json(
        {
          success: false,
          message: "detail does not belong to the specified project",
        },
        400,
      );
    }

    return c.json({
      success: true,
      message: `detail ID: ${detail.id} retrieved successfully`,
      data: detail,
    });
  })
  .post(
    "/:id/details",
    zValidator("json", projectDetailCreateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const addedDetail = await projectService.addDetails(id, validatedBody);
      return c.json({
        success: true,
        message: `new detail created with ID: ${addedDetail.id}`,
        data: addedDetail,
      });
    },
  )
  .patch(
    "/:id/details/:detailId",
    zValidator("json", projectDetailUpdateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const detailId = Number(c.req.param("detailId"));
      const validatedBody = c.req.valid("json");

      const existingDetail = await projectService.getDetailById(id);

      if (existingDetail.projectId !== id) {
        return c.json(
          { message: "detail does not belong to the specified project" },
          400,
        );
      }

      const updatedDetail = await projectService.updateDetails(
        detailId,
        validatedBody,
      );

      return c.json({
        success: true,
        message: `detail ID: ${detailId} updated successfully`,
        data: updatedDetail,
      });
    },
  )
  .get("/:id/technologies", async (c) => {
    const techs = await projectTechStackService.getAll();
    return c.json({
      success: true,
      message: `retrieved ${techs.length} records successfully`,
      data: techs,
    });
  })
  .post(
    "/:id/technologies",
    zValidator("json", projectTechnologyCreateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");
      const data = await projectTechStackService.addTech(id, validatedBody);
      return c.json({
        success: true,
        message: "new record created",
        data,
      });
    },
  )
  .patch(
    "/:id/technologies/:techId",
    zValidator("json", projectTechnologyUpdateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const techId = Number(c.req.param("techId"));
      const validated = c.req.valid("json");

      const existingTechStack = await projectTechStackService.getByProjectId(
        techId,
      );
      if (existingTechStack.projectId !== id) {
        return c.json(
          {
            success: false,
            message: "detail does not belong to the given tech",
          },
          404,
        );
      }
      const updated = await projectTechStackService.update(techId, validated);
      return c.json({
        success: true,
        message: "tech stack updated",
        data: updated,
      });
    },
  )
  .delete("/:id/technologies/:techId", async (c) => {
    const techId = Number(c.req.param("techId"));
    const id = Number(c.req.param("id"));

    await projectService.getById(id);

    await projectTechStackService.delete(techId);
    return c.json({
      success: true,
      message: `record id: ${techId} deleted successfully`,
    });
  });
