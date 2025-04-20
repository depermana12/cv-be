import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { PersonalService } from "../services/personal.service";
import {
  personalCreateSchema,
  personalUpdateSchema,
} from "../schemas/personal.schema";

const personalService = new PersonalService();
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
  .post("/", zValidator("json", personalCreateSchema), async (c) => {
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
  })
  .patch("/:id", zValidator("json", personalUpdateSchema), async (c) => {
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
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await personalService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
