import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  Personal,
  Education,
  WorkExp,
  OrgExp,
  Project,
  Course,
  Skill,
  SoftSkill,
  ProjectTech,
} from "../services/cvs";

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

const projectDetailSchema = z.object({
  description: z.string().max(1000),
});

const orgExpDetailSchema = z.object({
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

const courseSchema = z.object({
  personalInfoId: z.number().int(),
  courseName: z.string().max(100),
  provider: z.string().max(100),
  completionDate: z.coerce.date(),
  certificateUrl: z.string().url().optional(),
});

const skillSchema = z.object({
  personalInfoId: z.number().int(),
  category: z.string().max(50),
  name: z.string().max(100),
});

const softSkillSchema = z.object({
  personalInfoId: z.number().int(),
  category: z.string().max(50),
  description: z.string(),
});

const projectTechSchema = z.object({
  technology: z.string().max(100),
  projectId: z.number().int(),
  category: z.string().max(100),
});

const personalService = new Personal();
const educationService = new Education();
const workExpService = new WorkExp();
const orgExpService = new OrgExp();
const projectService = new Project();
const courseService = new Course();
const projectTechService = new ProjectTech();
const skillService = new Skill();
const softSkillService = new SoftSkill();

export const personalRoutes = new Hono();
personalRoutes
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
    const eduId = c.req.param("id");
    const edu = educationService.getById(Number(eduId));
    if (!edu) {
      return c.json({ message: "education not found" }, 404);
    }
    return c.json({ message: "success get education id", data: edu }, 200);
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

export const workExpRoutes = new Hono();
workExpRoutes
  .get("/", async (c) => {
    const works = await workExpService.getAll();
    return c.json({
      message: "success get all work experience",
      data: works,
    });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const work = await workExpService.getById(id);
    if (!work) {
      return c.json({ message: "work experience not found" }, 404);
    }
    return c.json({ message: "success get work experience by id", data: work });
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
      const validatedBody = c.req.valid("json");
      const newWork = await workExpService.create(validatedBody);
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
      const workExpId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");
      const existing = await workExpService.getById(workExpId);
      if (!existing) {
        return c.json({ message: "work experience not found" }, 404);
      }

      const updatedWorkExp = await workExpService.update(
        workExpId,
        validatedBody,
      );
      return c.json({
        message: "work experience updated",
        data: updatedWorkExp,
      });
    },
  )
  .delete("/:id", async (c) => {
    const WorkExpId = Number(c.req.param("id"));
    const work = await workExpService.getById(WorkExpId);
    if (!work) {
      return c.json({ message: "work experience not found" }, 404);
    }
    await workExpService.delete(WorkExpId);
    return c.json({ message: "work experience deleted", data: work });
  });

// for the detail work experience
workExpRoutes
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
      const validatedBody = c.req.valid("json");

      const parent = await workExpService.getById(workExpId);
      if (!parent) {
        return c.json({ message: "work experience not found" }, 404);
      }

      const data = await workExpService.addDetail(workExpId, validatedBody);
      return c.json({ message: "detail added", data });
    },
  )
  .patch(
    "/:id/details/:detailId",
    zValidator("json", workExpDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const workExpId = Number(c.req.param("id"));
      const detailId = Number(c.req.param("detailId"));
      const validatedBody = c.req.valid("json");

      const existingDetail = await workExpService.getDetailById(detailId);
      if (!existingDetail) {
        return c.json({ message: "work experience detail not found" }, 404);
      }

      if (existingDetail.workExperienceId !== workExpId) {
        return c.json(
          { message: "detail does not belong to the given work experience" },
          404,
        );
      }

      const updatedDetail = await workExpService.updateDetails(
        detailId,
        validatedBody,
      );
      return c.json({
        message: "work experience detail updated",
        data: updatedDetail,
      });
    },
  );

export const orgExpRoutes = new Hono();
orgExpRoutes
  .get("/", async (c) => {
    const orgs = await orgExpService.getAll();
    return c.json({ message: "success get all org experiences", orgs });
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
      const validatedBody = c.req.valid("json");
      const newOrg = await orgExpService.create(validatedBody);
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
      const orgExpId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const org = await orgExpService.getById(orgExpId);
      if (!org) {
        return c.json({ message: "org experience not found" }, 404);
      }

      const updatedOrgExp = await orgExpService.update(orgExpId, validatedBody);
      return c.json({ message: "org experience updated", data: updatedOrgExp });
    },
  )
  .delete("/:id", async (c) => {
    const OrgExpId = Number(c.req.param("id"));
    const org = await orgExpService.getById(OrgExpId);
    if (!org) {
      return c.json({ message: "org experience not found" }, 404);
    }
    await orgExpService.delete(OrgExpId);
    return c.json({ message: "org experience deleted", data: org });
  });

// detail org experience
orgExpRoutes
  .post(
    "/:id/details",
    zValidator("json", orgExpDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const orgExpId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const parent = await orgExpService.getById(orgExpId);
      if (!parent) {
        return c.json({ message: "organization experience not found" }, 404);
      }

      const addedDetail = await orgExpService.addDetail(
        orgExpId,
        validatedBody,
      );
      return c.json({ message: "detail added", data: addedDetail });
    },
  )
  .patch(
    "/:id/details/:detailId",
    zValidator("json", orgExpDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const orgExpId = Number(c.req.param("id"));
      const detailId = Number(c.req.param("detailId"));
      const validatedBody = c.req.valid("json");

      const existingDetail = await orgExpService.getDetailById(detailId);
      if (!existingDetail) {
        return c.json(
          { message: "organization experience detail not found" },
          404,
        );
      }

      if (existingDetail.organizationExperienceId !== orgExpId) {
        return c.json(
          {
            message:
              "detail does not belong to the given organization experience",
          },
          404,
        );
      }

      const updatedDetail = await orgExpService.updateDetails(
        detailId,
        validatedBody,
      );
      return c.json({
        message: "organization experience detail updated",
        data: updatedDetail,
      });
    },
  );

export const projectRoutes = new Hono();
projectRoutes
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
projectRoutes
  .post(
    "/:id/details",
    zValidator("json", projectDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const projectId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const project = await projectService.getById(projectId);
      if (!project) {
        return c.json({ message: "project not found" }, 404);
      }

      const addedDetail = await projectService.addDetails(
        projectId,
        validatedBody,
      );
      return c.json({
        message: "project detail added",
        data: addedDetail,
      });
    },
  )
  .patch(
    "/:id/details/:detailId",
    zValidator("json", projectDetailSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const projectId = Number(c.req.param("id"));
      const detailId = Number(c.req.param("detailId"));
      const validatedBody = c.req.valid("json");

      const existingDetail = await projectService.getDetailById(projectId);

      if (!existingDetail) {
        return c.json({ message: "project detail not found" }, 404);
      }

      if (existingDetail.projectId !== projectId) {
        return c.json(
          { message: "detail does not belong to the specified project" },
          400,
        );
      }

      const updatedDetail = await projectService.updateDetails(
        detailId,
        validatedBody,
      );

      return c.json({
        message: "project detail updated",
        data: updatedDetail,
      });
    },
  );
projectRoutes
  .get("/:id/technologies", async (c) => {
    const id = Number(c.req.param("id"));

    const project = await projectService.getById(id);
    if (!project) {
      return c.json({ message: "project not found" }, 404);
    }

    const techs = await projectTechService.getAll();
    return c.json({ message: "success get project technologies", data: techs });
  })
  .post(
    "/:id/technologies",
    zValidator(
      "json",
      projectTechSchema.omit({ projectId: true }),
      (result, c) => {
        if (!result.success) {
          throw new HTTPException(400, {
            message: result.error.issues[0].message,
          });
        }
      },
    ),
    async (c) => {
      const projectId = Number(c.req.param("id"));
      const validatedBody = c.req.valid("json");

      const project = await projectService.getById(projectId);
      if (!project) {
        return c.json({ message: "project not found" }, 404);
      }

      const insertedId = await projectTechService.addTech(
        projectId,
        validatedBody,
      );
      return c.json({
        message: "tech stack added",
        data: { id: insertedId },
      });
    },
  )
  .patch(
    "/:id/technologies/:techId",
    zValidator("json", projectTechSchema.omit({ projectId: true })),
    async (c) => {
      const techId = Number(c.req.param("techId"));
      const validated = c.req.valid("json");

      const projectId = Number(c.req.param("id"));
      const project = await projectService.getById(projectId);
      if (!project) {
        return c.json({ message: "project not found" }, 404);
      }

      await projectTechService.update(techId, validated);
      const updated = await projectTechService.getByProjectId(projectId);
      return c.json({ message: "tech stack updated", data: updated });
    },
  )
  .delete("/:id/technologies/:techId", async (c) => {
    const techId = Number(c.req.param("techId"));
    const projectId = Number(c.req.param("id"));

    const project = await projectService.getById(projectId);
    if (!project) {
      return c.json({ message: "project not found" }, 404);
    }

    await projectTechService.delete(techId);
    return c.json({ message: "tech deleted" });
  });

export const courseRoutes = new Hono();
courseRoutes
  .get("/", async (c) => {
    const data = await courseService.getAll();
    return c.json({ message: "success get all courses", data });
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const course = await courseService.getById(id);
    if (!course) {
      return c.json({ message: "course not found" }, 404);
    }
    return c.json({ message: "success get course", data: course });
  })
  .post(
    "/",
    zValidator("json", courseSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const validated = c.req.valid("json");
      const newCourse = await courseService.create(validated);
      return c.json({ message: "new course created", data: newCourse }, 201);
    },
  )
  .patch(
    "/:id",
    zValidator("json", courseSchema, (result, c) => {
      if (!result.success) {
        throw new HTTPException(400, {
          message: result.error.issues[0].message,
        });
      }
    }),
    async (c) => {
      const id = Number(c.req.param("id"));
      const validated = c.req.valid("json");
      const course = await courseService.getById(id);
      if (!course) {
        return c.json({ message: "course not found" }, 404);
      }
      await courseService.update(id, validated);
      const updated = await courseService.getById(id);
      return c.json({ message: "course updated", data: updated });
    },
  )
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const course = await courseService.getById(id);
    if (!course) {
      return c.json({ message: "course not found" }, 404);
    }
    await courseService.delete(id);
    return c.json({ message: "course deleted", data: course });
  });

export const skillRoutes = new Hono();
skillRoutes
  .get("/", async (c) => {
    const data = await skillService.getAll();
    return c.json({ message: "success", data });
  })
  .get("/:id", async (c) => {
    const skillId = Number(c.req.param("id"));
    const skill = await skillService.getById(skillId);
    if (!skill) {
      return c.json({ message: "skill not found" }, 404);
    }
    return c.json({ message: "success get skill", data: skill });
  })
  .get("/categories", async (c) => {
    const categories = await skillService.getCategories();
    return c.json({ message: "success get categories", data: categories });
  })
  .post("/", zValidator("json", skillSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newSkill = await skillService.create(validatedBody);
    return c.json({ message: "created", data: newSkill }, 201);
  })
  .patch("/:id", zValidator("json", skillSchema), async (c) => {
    const skillId = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const updated = await skillService.update(skillId, validatedBody);
    return c.json({ message: "updated", data: updated });
  })
  .delete("/:id", async (c) => {
    const skillId = Number(c.req.param("id"));
    await skillService.delete(skillId);
    return c.json({ message: "deleted" });
  });

export const softSkillRoutes = new Hono();
softSkillRoutes
  .get("/", async (c) => {
    const data = await softSkillService.getAll();
    return c.json({ message: "success", data });
  })
  .get("/:id", async (c) => {
    const softSkillId = Number(c.req.param("id"));
    const softSkill = await softSkillService.getById(softSkillId);
    if (!softSkill) {
      return c.json({ message: "soft skill not found" }, 404);
    }
    return c.json({ message: "success get soft skill", data: softSkill });
  })
  .post("/", zValidator("json", softSkillSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newSoftSkill = await softSkillService.create(validatedBody);
    return c.json({ message: "created", data: newSoftSkill }, 201);
  })
  .patch("/:id", zValidator("json", softSkillSchema), async (c) => {
    const softSkillId = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const updated = await softSkillService.update(softSkillId, validatedBody);
    return c.json({ message: "updated", data: updated });
  })
  .delete("/:id", async (c) => {
    const softSkillId = Number(c.req.param("id"));
    await softSkillService.delete(softSkillId);
    return c.json({ message: "deleted" });
  });
