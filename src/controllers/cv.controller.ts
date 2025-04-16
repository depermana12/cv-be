import { Hono } from "hono";

import { CurriculumVitae } from "../services/cv.service";

const cvService = new CurriculumVitae();

// TODO: add validation check
export const cvRoutes = new Hono()
  .get("/", async (c) => {
    const cv = await cvService.getCV();
    return c.json(
      {
        success: true,
        message: "retrieved aggregrated records successfully",
        data: cv,
      },
      200,
    );
  })
  .get("/summary", async (c) => {
    const summary = await cvService.getSummary();
    return c.json(
      {
        success: true,
        message: "retrieved summarize records successfully",
        data: summary,
      },
      200,
    );
  });
// TODO: add import export
