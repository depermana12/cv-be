import { zValidator } from "../utils/validator";
import { LocationService } from "../services/location.service";
import {
  locationInsertSchema,
  locationQueryOptionsSchema,
  locationUpdateSchema,
} from "../schemas/location.schema";
import { LocationRepository } from "../repositories/location.repo";
import { createHonoBindings } from "../lib/create-hono";

const locationRepository = new LocationRepository();
const locationService = new LocationService(locationRepository);

export const locationRoutes = createHonoBindings()
  .get(
    "/:cvId/locations",
    zValidator("query", locationQueryOptionsSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const options = c.req.valid("query");

      const locations = await locationService.getAllLocations(cvId, options);

      return c.json({
        success: true,
        message: `retrieved ${locations.length} location records successfully`,
        data: locations,
      });
    },
  )
  .get("/:cvId/locations/:locationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const locationId = Number(c.req.param("locationId"));

    const location = await locationService.getLocation(cvId, locationId);

    return c.json({
      success: true,
      message: `location record ${locationId} retrieved successfully`,
      data: location,
    });
  })
  .post(
    "/:cvId/locations",
    zValidator("json", locationInsertSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const locationData = c.req.valid("json");

      const newLocation = await locationService.createLocation(
        cvId,
        locationData,
      );

      return c.json(
        {
          success: true,
          message: `location record created with ID: ${newLocation.id}`,
          data: newLocation,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/locations/:locationId",
    zValidator("json", locationUpdateSchema),
    async (c) => {
      const cvId = Number(c.req.param("cvId"));
      const locationId = Number(c.req.param("locationId"));
      const updateData = c.req.valid("json");

      const updatedLocation = await locationService.updateLocation(
        cvId,
        locationId,
        updateData,
      );

      return c.json({
        success: true,
        message: `location record ${locationId} updated successfully`,
        data: updatedLocation,
      });
    },
  )
  .delete("/:cvId/locations/:locationId", async (c) => {
    const cvId = Number(c.req.param("cvId"));
    const locationId = Number(c.req.param("locationId"));

    await locationService.deleteLocation(cvId, locationId);

    return c.json({
      success: true,
      message: `location record ${locationId} deleted successfully`,
    });
  });
