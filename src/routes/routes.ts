import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Personal, Education } from "../services/cvs";
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

const educationSchema = z.object({
  personalInfoId: z.number().int().optional(),
  institution: z.string().max(100),
  degree: z.string().max(100),
  fieldOfStudy: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  gpa: z.union([z.string(), z.null()]).optional(),
  maxGpa: z.union([z.string(), z.null()]).optional(),
});

const personalService = new Personal();
const educationService = new Education();

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
educationRoute
  .get("/", async (c) => {
    const education = await educationService.getAll();
    if (!education) {
      return c.json({ message: "person not found" }, 404);
    }
    return c.json(
      {
        message: "success get all education",
        data: education,
      },
      200,
    );
  })
  .post(
    "/",
    zValidator("json", educationSchema, (result, c) => {
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
    zValidator("json", educationSchema, (result, c) => {
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

export const workExpRoute = new Hono();
workExpRoute.get().post().patch().delete();

export const orgExpRoute = new Hono();
orgExpRoute.get().post().patch().delete();

export const projectsRoute = new Hono();
projectsRoute.get().post().patch().delete();

export const coursesRoute = new Hono();
coursesRoute.get().post().patch().delete();
