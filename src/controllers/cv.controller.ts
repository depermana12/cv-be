import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { jwt } from "../middlewares/auth";
import { verifiedEmail } from "../middlewares/verifiedEmail";
import {
  createCvSchema,
  updateCvSchema,
  cvQuerySchema,
  cvParamsSchema,
  cvSlugParamsSchema,
  popularCvQuerySchema,
  slugAvailabilityQuerySchema,
  constructCvQuerySchema,
  updateSectionOrderSchema,
  updateSectionTitlesSchema,
  updateSectionsSchema,
  pdfGenerationQuerySchema,
} from "../schemas/cv.schema";
import { cvService, pdfService } from "../lib/container";

export const cvRoutes = createHonoBindings()
  // Protected routes (require authentication and email verification)
  .use("/*", jwt())
  .use("/*", verifiedEmail)
  .get("/", zValidator("query", cvQuerySchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const options = c.req.valid("query");

    const cvs = await cvService.getAllCvs(+userId, options);

    return c.json(
      {
        success: true,
        message: `retrieved ${cvs.data.length} records successfully`,
        data: cvs.data,
        pagination: {
          total: cvs.total,
          limit: cvs.limit,
          offset: cvs.offset,
        },
      },
      200,
    );
  })
  .post("/", zValidator("json", createCvSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const { id: userId } = c.get("jwtPayload");

    const newCv = await cvService.createCv(validatedBody, +userId);

    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newCv,
      },
      201,
    );
  })
  .get("/me/stats", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const stats = await cvService.getUserStats(+userId);

    return c.json({
      success: true,
      message: "User CV statistics retrieved successfully",
      data: stats,
    });
  })
  .get(
    "/check-slug-availability",
    zValidator("query", slugAvailabilityQuerySchema),
    async (c) => {
      const { slug, excludeCvId } = c.req.valid("query");

      const result = await cvService.checkSlugAvailability(slug, excludeCvId);

      return c.json({
        success: true,
        message: "Slug availability checked successfully",
        data: result,
      });
    },
  )
  .get("/:id", zValidator("param", cvParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: cvId } = c.req.valid("param");

    const cv = await cvService.getCvById(cvId, +userId);

    return c.json(
      {
        success: true,
        message: `record ID: ${cvId} retrieved successfully`,
        data: cv,
      },
      200,
    );
  })
  .get(
    "/:id/construct",
    zValidator("param", cvParamsSchema),
    zValidator("query", constructCvQuerySchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const { style } = c.req.valid("query");

      const constructedCv = await cvService.constructCv(cvId, +userId, style);

      return c.json({
        success: true,
        message: `CV with ID ${cvId} constructed successfully`,
        data: constructedCv,
      });
    },
  )
  .patch(
    "/:id",
    zValidator("param", cvParamsSchema),
    zValidator("json", updateCvSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const validatedBody = c.req.valid("json");

      const updatedCv = await cvService.updateCv(cvId, +userId, validatedBody);

      return c.json(
        {
          success: true,
          message: `record ID: ${cvId} updated successfully`,
          data: updatedCv,
        },
        200,
      );
    },
  )
  .delete("/:id", zValidator("param", cvParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: cvId } = c.req.valid("param");

    const deleted = await cvService.deleteCv(cvId, +userId);

    return c.json({
      success: true,
      message: `CV with ID ${cvId} deleted successfully`,
      data: deleted,
    });
  })
  .patch(
    "/:id/sections/order",
    zValidator("param", cvParamsSchema),
    zValidator("json", updateSectionOrderSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const { order } = c.req.valid("json");

      await cvService.updateSectionOrder(cvId, +userId, order);

      return c.json({
        success: true,
        message: `Section order updated successfully for CV ${cvId}`,
      });
    },
  )
  .patch(
    "/:id/sections/titles",
    zValidator("param", cvParamsSchema),
    zValidator("json", updateSectionTitlesSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const { titles } = c.req.valid("json");

      await cvService.updateSectionTitles(cvId, +userId, titles);

      return c.json({
        success: true,
        message: `Section titles updated successfully for CV ${cvId}`,
      });
    },
  )
  .patch(
    "/:id/sections",
    zValidator("param", cvParamsSchema),
    zValidator("json", updateSectionsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const sectionUpdate = c.req.valid("json");

      await cvService.updateSections(cvId, +userId, sectionUpdate);

      return c.json({
        success: true,
        message: `Sections updated successfully for CV ${cvId}`,
      });
    },
  )
  .get("/:id/sections", zValidator("param", cvParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: cvId } = c.req.valid("param");

    const [order, titles] = await Promise.all([
      cvService.getSectionOrder(cvId, +userId),
      cvService.getSectionTitles(cvId, +userId),
    ]);

    return c.json({
      success: true,
      message: `Sections retrieved successfully for CV ${cvId}`,
      data: { order, titles },
    });
  });

// Public routes for cv with isPublic (no authentication required)
export const publicCvRoutes = createHonoBindings()
  .get(
    "/public/:username/:slug",
    zValidator("param", cvSlugParamsSchema),
    async (c) => {
      const { username, slug } = c.req.valid("param");

      const cv = await cvService.getCvByUsernameAndSlug(username, slug);

      return c.json({
        success: true,
        message: `CV '${slug}' for user '${username}' retrieved successfully`,
        data: cv,
      });
    },
  )
  .get(
    "/public/:id/download",
    zValidator("param", cvParamsSchema),
    async (c) => {
      const { id: cvId } = c.req.valid("param");

      const cv = await cvService.downloadCv(cvId);

      return c.json({
        success: true,
        message: `CV download tracked successfully`,
        data: cv,
      });
    },
  )
  .get(
    "/public/popular",
    zValidator("query", popularCvQuerySchema),
    async (c) => {
      const { limit } = c.req.valid("query");

      const popularCvs = await cvService.getPopularCvs(limit);

      return c.json({
        success: true,
        message: `Retrieved ${popularCvs.length} popular CVs`,
        data: popularCvs,
      });
    },
  )
  .get(
    "/:id/pdf",
    zValidator("param", cvParamsSchema),
    zValidator("query", pdfGenerationQuerySchema),
    async (c) => {
      const { id: cvId } = c.req.valid("param");
      const { style, scale } = c.req.valid("query");
      const { id: userId } = c.get("jwtPayload");

      const pdfBuffer = await pdfService.generateCVPDF(cvId, +userId, style, {
        scale,
      });

      // Set appropriate headers for PDF download
      c.header("Content-Type", "application/pdf");
      c.header("Content-Disposition", `attachment; filename="cv-${cvId}.pdf"`);

      return c.body(pdfBuffer);
    },
  )
  .get(
    "/:id/pdf/preview",
    zValidator("param", cvParamsSchema),
    zValidator("query", pdfGenerationQuerySchema),
    async (c) => {
      const { id: cvId } = c.req.valid("param");
      const { style } = c.req.valid("query");
      const { id: userId } = c.get("jwtPayload");

      const html = await pdfService.generateCVHTML(cvId, +userId, style);

      c.header("Content-Type", "text/html");

      return c.html(html);
    },
  );
