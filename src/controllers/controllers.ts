import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Personal, Education, WorkExp, OrgExp, Project } from "../services/cvs";
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

const workExpSchema = z.object({
  personalInfoId: z.number().int(),
  company: z.string().max(100),
  position: z.string().max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

const workExpDetailSchema = z.object({
  description: z.string().max(1000),
});

const orgExpSchema = z.object({
  personalInfoId: z.number().int(),
  organization: z.string().max(100),
  role: z.string().max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().max(1000).optional(),
});

const projectSchema = z.object({
  personalInfoId: z.number().int(),
  name: z.string().max(100),
  description: z.string().max(1000),
  techStack: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

const personalService = new Personal();
const educationService = new Education();
const workExpService = new WorkExp();
const orgExpService = new OrgExp();
const projectService = new Project();

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
workExpRoute
  .get("/", async (c) => {
    const allWork = await workExpService.getAll();
    return c.json({
      message: "success get all work experience",
      data: allWork,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const data = await workExpService.getById(id);
    if (!data) {
      return c.json({ message: "work experience not found" }, 404);
    }
    return c.json({ message: "success get work experience by id", data });
  })
  .post(
    "/",
    zValidator("json", workExpSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newWork = await workExpService.create(validated);
      return c.json(
        { message: "new work experience created", data: newWork },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", workExpSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validated = c.req.valid("json");
      const existing = await workExpService.getById(id);
      if (!existing) {
        return c.json({ message: "work experience not found" }, 404);
      }
      await workExpService.update(id, validated);
      const updated = await workExpService.getById(id);
      return c.json({ message: "work experience updated", data: updated });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const data = await workExpService.getById(id);
    if (!data) {
      return c.json({ message: "work experience not found" }, 404);
    }
    await workExpService.delete(id);
    return c.json({ message: "work experience deleted", data });
  });

// for the detail work experience
workExpRoute
  .post(
    "/:id/details",
    zValidator("json", workExpDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const workExpId = Number(c.req.param("id"));
      const validated = c.req.valid("json");
      const data = await workExpService.addDetails(workExpId, validated);
      return c.json({ message: "detail added", data });
    },
  )
  .patch(
    "/details/:detailId",
    zValidator("json", workExpDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const detailId = Number(c.req.param("detailId"));
      const validated = c.req.valid("json");
      const updated = await workExpService.updateDetails(detailId, validated);
      return c.json({
        message: "work experience detail updated",
        data: updated,
      });
    },
  );

export const orgExpRoute = new Hono();
orgExpRoute
  .get("/", async (c) => {
    const data = await orgExpService.getAll();
    return c.json({ message: "success get all org experiences", data });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const org = await orgExpService.getById(id);
    if (!org) {
      return c.json({ message: "organization experience not found" }, 404);
    }
    return c.json({
      message: "success get organization experience",
      data: org,
    });
  })
  .post(
    "/",
    zValidator("json", orgExpSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newOrg = await orgExpService.create(validated);
      return c.json(
        { message: "new org experience created", data: newOrg },
        201,
      );
    },
  )
  .patch(
    "/:id",
    zValidator("json", orgExpSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validated = c.req.valid("json");
      const org = await orgExpService.getById(id);
      if (!org) {
        return c.json({ message: "org experience not found" }, 404);
      }
      await orgExpService.update(id, validated);
      const updated = await orgExpService.getById(id);
      return c.json({ message: "org experience updated", data: updated });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const org = await orgExpService.getById(id);
    if (!org) {
      return c.json({ message: "org experience not found" }, 404);
    }
    await orgExpService.delete(id);
    return c.json({ message: "org experience deleted", data: org });
  });

export const projectRoute = new Hono();
projectRoute
  .get("/", async (c) => {
    const data = await projectService.getAll();
    return c.json({ message: "success get all projects", data });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const project = await projectService.getById(id);
    if (!project) {
      return c.json({ message: "project not found" }, 404);
    }
    return c.json({ message: "success get project", data: project });
  })
  .post(
    "/",
    zValidator("json", projectSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newProject = await projectService.create(validated);
      return c.json({ message: "new project created", data: newProject }, 201);
    },
  )
  .patch(
    "/:id",
    zValidator("json", projectSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validated = c.req.valid("json");
      const project = await projectService.getById(id);
      if (!project) {
        return c.json({ message: "project not found" }, 404);
      }
      await projectService.update(id, validated);
      const updated = await projectService.getById(id);
      return c.json({ message: "project updated", data: updated });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const project = await projectService.getById(id);
    if (!project) {
      return c.json({ message: "project not found" }, 404);
    }
    await projectService.delete(id);
    return c.json({ message: "project deleted", data: project });
  });

export const coursesRoute = new Hono();
coursesRoute.get().post().patch().delete();
