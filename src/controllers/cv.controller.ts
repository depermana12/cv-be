import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import {
  createCvSchema,
  updateCvSchema,
  cvQuerySchema,
  cvParamsSchema,
} from "../schemas/cv.schema";
import { cvService } from "../lib/container";

export const cvRoutes = createHonoBindings()
  .get("/", zValidator("query", cvQuerySchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const options = c.req.valid("query");

    const cvs = await cvService.getAllCvs(+userId, options);

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
  .post("/", zValidator("json", createCvSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const { id: userId } = c.get("jwtPayload");

    const newCv = await cvService.createCv(validatedBody, +userId);

    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newCv,
      },
      201,
    );
  })

  .get("/:id", zValidator("param", cvParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: cvId } = c.req.valid("param");

    const cv = await cvService.getCvById(cvId, +userId);

    return c.json(
      {
        success: true,
        message: `record ID: ${cvId} retrieved successfully`,
        data: cv,
      },
      200,
    );
  })

  .patch(
    "/:id",
    zValidator("param", cvParamsSchema),
    zValidator("json", updateCvSchema),
    async (c) => {
      const { id: userId } = c.get("jwtPayload");
      const { id: cvId } = c.req.valid("param");
      const validatedBody = c.req.valid("json");

      const updatedCv = await cvService.updateCv(cvId, +userId, validatedBody);

      return c.json(
        {
          success: true,
          message: `record ID: ${cvId} updated successfully`,
          data: updatedCv,
        },
        200,
      );
    },
  )

  .delete("/:id", zValidator("param", cvParamsSchema), async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const { id: cvId } = c.req.valid("param");

    const deleted = await cvService.deleteCv(cvId, +userId);

    return c.json({
      success: true,
      message: `record id: ${cvId} deleted successfully`,
      data: deleted ? "Record deleted" : "Record not found",
    });
  });
