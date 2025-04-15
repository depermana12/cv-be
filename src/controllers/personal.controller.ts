import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { Personal } from "../services/personal.service";
import {
  fullPersonalCreateSchema,
  fullPersonalUpdateSchema,
} from "../schemas/personal.schema";

const personalService = new Personal();
export const personalRoutes = new Hono();

personalRoutes
  .get("/", async (c) => {
    const personalInfo = await personalService.getAll();

    return c.json(
      {
        message: "success get personal info",
        data: personalInfo,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const personId = c.req.param("id");
    const personalInfo = await personalService.getById(Number(personId));
    return c.json(
      {
        message: "success get personal info",
        data: personalInfo,
      },
      200,
    );
  })
  .post(
    "/",
    zValidator("json", fullPersonalCreateSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validatedBody = c.req.valid("json");
      const newPersonData = await personalService.create(validatedBody);
      return c.json({ message: "person created", data: newPersonData }, 201);
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
      const personId = c.req.param("id");
      const validatedBody = c.req.valid("json");

      const personUpdated = await personalService.update(
        Number(personId),
        validatedBody,
      );
      return c.json({ message: "person updated", data: personUpdated }, 200);
    },
  )
  .delete("/:id", async (c) => {
    const personId = c.req.param("id");
    const personToBeDeleted = await personalService.getById(Number(personId));
    if (!personToBeDeleted) {
      return c.json({ message: "person not found" }, 404);
    }
    await personalService.delete(Number(personId));
    return c.json({
      message: "this person has been deleted",
      data: personToBeDeleted,
    });
  });
