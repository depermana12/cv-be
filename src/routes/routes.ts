import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Personal } from "../services/cvs";
import { HTTPException } from "hono/http-exception";

const newPersonSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  location: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  bio: z.string().optional(),
});

const personalService = new Personal();

export const personalRoute = new Hono();
personalRoute
  .get("/", async (c) => {
    const personalInfo = await personalService.get();
    if (!personalInfo) {
      return c.json({ message: "person not found" }, 404);
    }
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
    zValidator("json", newPersonSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newPersonData = await personalService.create(validated);
      return c.json({ message: "person created", data: newPersonData }, 201);
    },
  )
  .patch(
    "/:id",
    zValidator("json", newPersonSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const personId = c.req.param("id");
      const validated = c.req.valid("json");
      await personalService.update(Number(personId), validated);
      const personUpdated = await personalService.getById(Number(personId));
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

export const educationRoute = new Hono();
educationRoute.get().post().patch().delete();

export const workExpRoute = new Hono();
workExpRoute.get().post().patch().delete();

export const orgExpRoute = new Hono();
orgExpRoute.get().post().patch().delete();

export const projectsRoute = new Hono();
projectsRoute.get().post().patch().delete();

export const coursesRoute = new Hono();
coursesRoute.get().post().patch().delete();
