import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { Personal } from "../services/personal.service";
import {
  fullPersonalCreateSchema,
  fullPersonalUpdateSchema,
} from "../schemas/personal.schema";

const personalService = new Personal();
export const personalRoutes = new Hono()
  .get("/", async (c) => {
    const personalInfo = await personalService.getAll();

    return c.json(
      {
        success: true,
        message: `retrieved ${personalInfo.length} records successfully`,
        data: personalInfo,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const personalInfo = await personalService.getById(Number(id));
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: personalInfo,
      },
      200,
    );
  })
  .post(
    "/",
    zValidator("json", fullPersonalCreateSchema, (result, c) => {
      if (!result.success) {
        console.error(result.error.format());
        throw new HTTPException(400, {
          message: JSON.stringify(result.error.issues),
        });
      }
    }),
    async (c) => {
      const validatedBody = c.req.valid("json");
      const newPersonData = await personalService.create(validatedBody);
      return c.json(
        {
          success: true,
          message: `new record created`,
          data: newPersonData,
        },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", fullPersonalUpdateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = c.req.param("id");
      const validatedBody = c.req.valid("json");

      const personUpdated = await personalService.update(
        Number(id),
        validatedBody,
      );
      return c.json(
        {
          success: true,
          message: `record ID: ${id} updated successfully`,
          data: personUpdated,
        },
        200,
      );
    },
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await personalService.delete(Number(id));
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
