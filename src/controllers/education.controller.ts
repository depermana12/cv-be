import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

import { educationService } from "../services/index.service";
import {
  educationCreateSchema,
  educationUpdateSchema,
} from "../schemas/education.schema";

export const educationRoutes = new Hono();
educationRoutes
  .get("/", async (c) => {
    const education = await educationService.getAll();
    if (!education) {
      return c.json({ message: "education not found" }, 404);
    }
    return c.json(
      {
        message: "success get all education",
        data: education,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const educationId = Number(c.req.param("id"));

    const education = await educationService.getById(educationId);
    if (!education) {
      return c.json({ message: "education not found" }, 404);
    }
    return c.json(
      { message: "success get education id", data: education },
      200,
    );
  })
  .post(
    "/",
    zValidator("json", educationCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newEducation = await educationService.create(validated);
      return c.json(
        {
          message: "new education created",
          data: newEducation,
        },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", educationUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const eduId = c.req.param("id");
      const validated = c.req.valid("json");

      const getEdu = await educationService.getById(Number(eduId));
      if (!getEdu) {
        return c.json({ message: "education id not found" }, 404);
      }
      await educationService.update(Number(eduId), validated);
      const updatedEdu = await educationService.getById(Number(eduId));
      return c.json(
        {
          message: "education has been updated",
          data: updatedEdu,
        },
        200,
      );
    },
  )
  .delete("/:id", async (c) => {
    const eduId = c.req.param("id");
    const eduToBeDeleted = await educationService.getById(Number(eduId));
    if (!eduToBeDeleted) {
      return c.json({ message: "edu not found" }, 404);
    }
    await educationService.delete(Number(eduId));
    return c.json({
      message: "this education has been deleted",
      data: eduToBeDeleted,
    });
  });
