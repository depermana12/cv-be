import { CvService } from "../services/cv.service";
import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import {
  cvInsertSchema,
  cvUpdateSchema,
  cvQueryOptionsSchema,
} from "../schemas/cv.schema";
import { CvRepository } from "../repositories/cv.repo";
import { getDb } from "../db";

const db = await getDb();
const cvService = new CvService(new CvRepository(db));

export const cvRoutes = createHonoBindings()
  .get("/", zValidator("query", cvQueryOptionsSchema), async (c) => {
    const { id } = c.get("jwtPayload");
    const options = c.req.valid("query");

    const cvs = await cvService.getAllCvs(Number(id), options);

    return c.json(
      {
        success: true,
        message: `retrieved ${cvs.data.length} records successfully`,
        data: cvs.data,
        pagination: {
          total: cvs.total,
          limit: cvs.limit,
          offset: cvs.offset,
        },
      },
      200,
    );
  })
  .post("/", zValidator("json", cvInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const { id } = c.get("jwtPayload");

    const newCv = await cvService.createCv(validatedBody, Number(id));

    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newCv,
      },
      201,
    );
  })

  .get("/:id", async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const cvId = Number(c.req.param("id"));

    const cv = await cvService.getCvById(cvId, Number(userId));

    return c.json(
      {
        success: true,
        message: `record ID: ${cvId} retrieved successfully`,
        data: cv,
      },
      200,
    );
  })

  .patch("/:id", zValidator("json", cvUpdateSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const cvId = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const updatedCv = await cvService.updateCv(
      cvId,
      Number(userId),
      validatedBody,
    );

    return c.json(
      {
        success: true,
        message: `record ID: ${cvId} updated successfully`,
        data: updatedCv,
      },
      200,
    );
  })

  .delete("/:id", async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const cvId = Number(c.req.param("id"));

    const deleted = await cvService.deleteCv(cvId, Number(userId));

    return c.json({
      success: true,
      message: `record id: ${cvId} deleted successfully`,
      data: deleted ? "Record deleted" : "Record not found",
    });
  });
