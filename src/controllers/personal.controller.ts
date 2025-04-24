import { zValidator } from "../utils/validator";
import { PersonalService } from "../services/personal.service";
import {
  personalInsertSchema,
  personalUpdateSchema,
} from "../db/schema/personal.db";
import { createHonoBindings } from "../lib/create-hono";

const personalService = new PersonalService();
export const personalRoutes = createHonoBindings()
  .get("/", async (c) => {
    const intro = await personalService.getAll();

    return c.json(
      {
        success: true,
        message: `retrieved ${intro.length} records successfully`,
        data: intro,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const intro = await personalService.getById(id);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: intro,
      },
      200,
    );
  })
  .post("/", zValidator("json", personalInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const { id } = c.get("jwtPayload");
    const newPersonal = await personalService.create({
      ...validatedBody,
      userId: Number(id),
    });
    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newPersonal,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", personalUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const introUpdated = await personalService.update(id, validatedBody);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: introUpdated,
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
