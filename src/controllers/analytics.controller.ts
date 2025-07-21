import { createHonoBindings } from "../lib/create-hono";
import { z } from "zod";
import { zValidator } from "../utils/validator";
import { analyticsService } from "../lib/container.js";
import {
  daysSchema,
  goalSchema,
  timeRangeSchema,
} from "../schemas/analytic.schema.js";

export const analyticsRoutes = createHonoBindings()
  .get("/metrics", zValidator("query", timeRangeSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { timeRange } = c.req.valid("query");

    const metrics = await analyticsService.getApplicationMetrics(
      +userId,
      timeRange,
    );

    return c.json({
      success: true,
      message: "Application metrics retrieved successfully",
      data: metrics,
    });
  })
  .get("/status-distribution", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const distribution = await analyticsService.getStatusDistribution(+userId);

    return c.json({
      success: true,
      message: "Status distribution retrieved successfully",
      data: distribution,
    });
  })
  .get("/trends", zValidator("query", daysSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { days } = c.req.valid("query");

    const trends = await analyticsService.getApplicationTrends(+userId, days);

    return c.json({
      success: true,
      message: "Application trends retrieved successfully",
      data: trends,
    });
  })
  .get("/portal-performance", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const performance = await analyticsService.getPortalPerformance(+userId);

    return c.json({
      success: true,
      message: "Portal performance retrieved successfully",
      data: performance,
    });
  })
  .get("/time-to-response", async (c) => {
    const { id: userId } = c.get("jwtPayload");

    const result = await analyticsService.getAverageTimeToResponse(+userId);

    return c.json({
      success: true,
      message: result.hasData
        ? "Average time to response retrieved successfully"
        : "No interview response data available yet",
      data: result,
    });
  })
  .get("/monthly-progress", zValidator("query", goalSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { goal } = c.req.valid("query");

    const progress = await analyticsService.getMonthlyProgress(+userId, goal);

    return c.json({
      success: true,
      message: "Monthly progress retrieved successfully",
      data: progress,
    });
  });
