import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { jwt } from "../middlewares/auth";
import { verifiedEmail } from "../middlewares/verifiedEmail";
import {
  sectionImproveSchema,
  cvScoreSchema,
  cvIdParamsSchema,
} from "../schemas/aiOptimization.schema";
import { aiOptimizationService } from "../lib/container";

export const aiOptimizationRoutes = createHonoBindings()
  // require authentication and email verification
  .use("/*", jwt())
  .use("/*", verifiedEmail)
  .post(
    "/section/improve",
    zValidator("json", sectionImproveSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const request = c.req.valid("json");

      const result = await aiOptimizationService.improveSection(
        request,
        +userId,
      );

      return c.json(
        {
          success: true,
          message: "Section improved successfully",
          data: {
            optimizationRequest: result.optimizationRequest,
            aiResponse: result.aiResponse,
          },
        },
        201,
      );
    },
  )
  .post("/cv/score", zValidator("json", cvScoreSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const request = c.req.valid("json");

    const result = await aiOptimizationService.scoreCv(request, +userId);

    return c.json(
      {
        success: true,
        message: "CV scored successfully",
        data: {
          optimizationRequest: result.optimizationRequest,
          score: result.score,
          aiResponse: result.aiResponse,
        },
      },
      201,
    );
  })
  .get(
    "/cvs/:cvId/score/latest",
    zValidator("param", cvIdParamsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { cvId } = c.req.valid("param");

      const score = await aiOptimizationService.getLatestCvScore(cvId, +userId);

      return c.json({
        success: true,
        message: "Latest CV score retrieved successfully",
        data: score,
      });
    },
  )
  .get(
    "/cvs/:cvId/scores", // Get CV score history
    zValidator("param", cvIdParamsSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { cvId } = c.req.valid("param");
      const limit = Number(c.req.query("limit")) || 10;

      const scores = await aiOptimizationService.getCvScoreHistory(
        cvId,
        +userId,
        limit,
      );

      return c.json({
        success: true,
        message: `Retrieved ${scores.length} CV scores`,
        data: scores,
      });
    },
  )
  .get("/usage", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const usage = await aiOptimizationService.checkUserUsage(+userId);

    return c.json({
      success: true,
      message: "Usage limits retrieved successfully",
      data: usage,
    });
  });
