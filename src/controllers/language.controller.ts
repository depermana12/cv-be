import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { languageService } from "../lib/container";
import {
  createLanguageSchema,
  updateLanguageSchema,
  cvIdParamsSchema,
  languageParamsSchema,
} from "../schemas/language.schema";

export const languageRoutes = createHonoBindings()
  .get("/:cvId/languages", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const languages = await languageService.getAll(cvId);

    return c.json({
      success: true,
      message: "Languages retrieved successfully",
      data: languages,
    });
  })
  .get(
    "/:cvId/languages/:languageId",
    zValidator("param", languageParamsSchema),
    async (c) => {
      const { cvId, languageId } = c.req.valid("param");

      const language = await languageService.getOne(cvId, languageId);

      return c.json({
        success: true,
        message: "Language retrieved successfully",
        data: language,
      });
    },
  )
  .post(
    "/:cvId/languages",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createLanguageSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const languageData = c.req.valid("json");

      const language = await languageService.create(cvId, languageData);

      return c.json(
        {
          success: true,
          message: "Language created successfully",
          data: language,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/languages/:languageId",
    zValidator("param", languageParamsSchema),
    zValidator("json", updateLanguageSchema),
    async (c) => {
      const { cvId, languageId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const language = await languageService.update(
        cvId,
        languageId,
        updateData,
      );

      return c.json({
        success: true,
        message: "Language updated successfully",
        data: language,
      });
    },
  )
  .delete(
    "/:cvId/languages/:languageId",
    zValidator("param", languageParamsSchema),
    async (c) => {
      const { cvId, languageId } = c.req.valid("param");

      const deleted = await languageService.delete(cvId, languageId);

      return c.json({
        success: true,
        message: "Language deleted successfully",
        data: deleted,
      });
    },
  );
