import { createHonoBindings } from "../lib/create-hono";
import { zValidator } from "../utils/validator";
import { contactService } from "../lib/container";
import {
  createContactSchema,
  updateContactSchema,
  cvIdParamsSchema,
  contactParamsSchema,
} from "../schemas/contact.schema";

export const contactRoutes = createHonoBindings()
  .get("/:cvId/contacts", zValidator("param", cvIdParamsSchema), async (c) => {
    const { cvId } = c.req.valid("param");

    const contacts = await contactService.getAll(cvId);

    return c.json({
      success: true,
      message: "Contacts retrieved successfully",
      data: contacts,
    });
  })
  .get(
    "/:cvId/contacts/:contactId",
    zValidator("param", contactParamsSchema),
    async (c) => {
      const { cvId, contactId } = c.req.valid("param");

      const contact = await contactService.getOne(cvId, contactId);

      return c.json({
        success: true,
        message: "Contact retrieved successfully",
        data: contact,
      });
    },
  )
  .post(
    "/:cvId/contacts",
    zValidator("param", cvIdParamsSchema),
    zValidator("json", createContactSchema),
    async (c) => {
      const { cvId } = c.req.valid("param");
      const contactData = c.req.valid("json");

      const contact = await contactService.create(cvId, contactData);

      return c.json(
        {
          success: true,
          message: "Contact created successfully",
          data: contact,
        },
        201,
      );
    },
  )
  .patch(
    "/:cvId/contacts/:contactId",
    zValidator("param", contactParamsSchema),
    zValidator("json", updateContactSchema),
    async (c) => {
      const { cvId, contactId } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const contact = await contactService.update(
        cvId,
        contactId,
        updateData,
      );

      return c.json({
        success: true,
        message: "Contact updated successfully",
        data: contact,
      });
    },
  )
  .delete(
    "/:cvId/contacts/:contactId",
    zValidator("param", contactParamsSchema),
    async (c) => {
      const { cvId, contactId } = c.req.valid("param");

      const deleted = await contactService.delete(cvId, contactId);

      return c.json({
        success: true,
        message: "Contact deleted successfully",
        data: deleted,
      });
    },
  );
