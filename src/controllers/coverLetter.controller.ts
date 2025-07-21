import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import {
  coverLetterInsertSchema,
  coverLetterUpdateSchema,
  coverLetterQuerySchema,
  coverLetterTemplateInsertSchema,
  coverLetterTemplateUpdateSchema,
  coverLetterTemplateQuerySchema,
  generateFromTemplateSchema,
} from "../schemas/coverLetter.schema";
import { coverLetterService } from "../lib/container.js";

export const coverLetterRoutes = createHonoBindings()
  .get(
    "/templates",
    zValidator("query", coverLetterTemplateQuerySchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const query = c.req.valid("query");

      const templates = await coverLetterService.getTemplates(
        Number(id),
        query,
      );

      return c.json({
        success: true,
        message: `Retrieved ${templates.data.length} templates successfully`,
        data: templates.data,
        pagination: templates.pagination,
      });
    },
  )
  .post(
    "/templates",
    zValidator("json", coverLetterTemplateInsertSchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const data = c.req.valid("json");

      const template = await coverLetterService.createTemplate(
        Number(id),
        data,
      );

      return c.json(
        {
          success: true,
          message: "Template created successfully",
          data: template,
        },
        201,
      );
    },
  )
  .get("/templates/:templateId", async (c) => {
    const { id } = c.get("jwtPayload");
    const templateId = Number(c.req.param("templateId"));

    const template = await coverLetterService.getTemplateById(
      Number(id),
      templateId,
    );

    if (!template) {
      return c.json(
        {
          success: false,
          message: "Template not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Template retrieved successfully",
      data: template,
    });
  })
  .patch(
    "/templates/:templateId",
    zValidator("json", coverLetterTemplateUpdateSchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const templateId = Number(c.req.param("templateId"));
      const data = c.req.valid("json");
      const template = await coverLetterService.updateTemplate(
        Number(id),
        templateId,
        data,
      );

      if (!template) {
        return c.json(
          {
            success: false,
            message: "Template not found",
          },
          404,
        );
      }

      return c.json({
        success: true,
        message: "Template updated successfully",
        data: template,
      });
    },
  )
  .delete("/templates/:templateId", async (c) => {
    const { id } = c.get("jwtPayload");
    const templateId = Number(c.req.param("templateId"));
    await coverLetterService.deleteTemplate(Number(id), templateId);

    return c.json({
      success: true,
      message: "Template deleted successfully",
    });
  })

  /**
   * COVER LETTER ROUTES
   */
  // GET /api/v1/cover-letters
  .get("/", zValidator("query", coverLetterQuerySchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const query = c.req.valid("query");
    const coverLetters = await coverLetterService.getCoverLetters(
      Number(id),
      query,
    );

    return c.json({
      success: true,
      message: `Retrieved ${coverLetters.data.length} cover letters successfully`,
      data: coverLetters.data,
      pagination: coverLetters.pagination,
    });
  })
  .post("/", zValidator("json", coverLetterInsertSchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const data = c.req.valid("json");

    try {
      const coverLetter = await coverLetterService.createCoverLetter(
        Number(id),
        data,
      );

      return c.json(
        {
          success: true,
          message: "Cover letter created successfully",
          data: coverLetter,
        },
        201,
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          message: (error as Error).message,
        },
        400,
      );
    }
  })
  .get("/:coverLetterId", async (c) => {
    const { id } = c.get("jwtPayload");
    const coverLetterId = Number(c.req.param("coverLetterId"));
    const coverLetter = await coverLetterService.getCoverLetterById(
      Number(id),
      coverLetterId,
    );

    if (!coverLetter) {
      return c.json(
        {
          success: false,
          message: "Cover letter not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Cover letter retrieved successfully",
      data: coverLetter,
    });
  })
  .patch(
    "/:coverLetterId",
    zValidator("json", coverLetterUpdateSchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const coverLetterId = Number(c.req.param("coverLetterId"));
      const data = c.req.valid("json");
      const coverLetter = await coverLetterService.updateCoverLetter(
        Number(id),
        coverLetterId,
        data,
      );

      if (!coverLetter) {
        return c.json(
          {
            success: false,
            message: "Cover letter not found",
          },
          404,
        );
      }

      return c.json({
        success: true,
        message: "Cover letter updated successfully",
        data: coverLetter,
      });
    },
  )
  .delete("/:coverLetterId", async (c) => {
    const { id } = c.get("jwtPayload");
    const coverLetterId = Number(c.req.param("coverLetterId"));
    await coverLetterService.deleteCoverLetter(Number(id), coverLetterId);

    return c.json({
      success: true,
      message: "Cover letter deleted successfully",
    });
  })

  /**
   * SPECIAL OPERATIONS
   */
  // POST /api/v1/cover-letters/generate
  .post(
    "/generate",
    zValidator("json", generateFromTemplateSchema),
    async (c) => {
      const { id } = c.get("jwtPayload");
      const data = c.req.valid("json");

      try {
        const coverLetter = await coverLetterService.generateFromTemplate(
          Number(id),
          data,
        );

        return c.json(
          {
            success: true,
            message: "Cover letter generated successfully",
            data: coverLetter,
          },
          201,
        );
      } catch (error) {
        return c.json(
          {
            success: false,
            message: (error as Error).message,
          },
          400,
        );
      }
    },
  )
  .post("/:coverLetterId/duplicate", async (c) => {
    const { id } = c.get("jwtPayload");
    const coverLetterId = Number(c.req.param("coverLetterId"));

    try {
      const duplicatedCoverLetter =
        await coverLetterService.duplicateCoverLetter(
          Number(id),
          coverLetterId,
        );

      return c.json(
        {
          success: true,
          message: "Cover letter duplicated successfully",
          data: duplicatedCoverLetter,
        },
        201,
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          message: (error as Error).message,
        },
        400,
      );
    }
  })
  .get("/stats", async (c) => {
    const { id } = c.get("jwtPayload");
    const stats = await coverLetterService.getCoverLetterStats(Number(id));

    return c.json({
      success: true,
      message: "Cover letter statistics retrieved successfully",
      data: stats,
    });
  });
