import { Hono } from "hono";
import { zValidator } from "../utils/validator";
import { LocationService } from "../services/location.service";
import { locationInsertSchema } from "../db/schema/location.db";
import { locationUpdateSchema } from "../schemas/personal.schema";

const locationService = new LocationService();
export const locationRoutes = new Hono()
  .get("/", async (c) => {
    const data = await locationService.getAll();

    return c.json(
      {
        success: true,
        message: `retrieved ${data.length} records successfully`,
        data: data,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const data = await locationService.getById(id);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} retrieved successfully`,
        data: data,
      },
      200,
    );
  })
  .post("/", zValidator("json", locationInsertSchema), async (c) => {
    const validatedBody = c.req.valid("json");
    const newData = await locationService.create(validatedBody);
    return c.json(
      {
        success: true,
        message: `new record created`,
        data: newData,
      },
      201,
    );
  })
  .patch("/:id", zValidator("json", locationUpdateSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const validatedBody = c.req.valid("json");

    const dataUpdated = await locationService.update(id, validatedBody);
    return c.json(
      {
        success: true,
        message: `record ID: ${id} updated successfully`,
        data: dataUpdated,
      },
      200,
    );
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    await locationService.delete(id);
    return c.json({
      success: true,
      message: `record id: ${id} deleted successfully`,
    });
  });
