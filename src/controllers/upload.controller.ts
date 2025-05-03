import { Hono } from "hono";
import {
  generatePresignedUploadUrl,
  generatePresignedGetUrl,
  deleteObject,
  directUpload,
  listObjects,
} from "../services/sThree.service";
import type { Bindings } from "../lib/types";
import { UploadError } from "../errors/upload.error";
import { zValidator } from "../utils/validator";
import {
  fileUploadSchema,
  presignedUploadSchema,
} from "../schemas/upload.schema";

// Route to get a presigned URL for client-side uploads
export const uploadRoutes = new Hono<Bindings>()
  .post("/presigned", zValidator("json", presignedUploadSchema), async (c) => {
    try {
      const { fileType } = c.req.valid("json");

      const { url, key } = await generatePresignedUploadUrl(fileType);

      return c.json({
        success: true,
        message: "presigned URL generated successfully",
        data: {
          key,
          url,
        },
      });
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError("failed to generate presigned URL", 500, {
        cause: error,
      });
    }
  })
  .get("/images/:key", async (c) => {
    try {
      const key = c.req.param("key");
      const url = await generatePresignedGetUrl(key);

      return c.json({
        success: true,
        message: "presigned URL generated successfully",
        data: {
          url,
        },
      });
    } catch (error) {
      throw new UploadError("error generating presigned get URL", 500, {
        cause: error,
      });
    }
  })
  .delete("/images/:key", async (c) => {
    try {
      const key = c.req.param("key");
      await deleteObject(key);

      return c.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      return c.json({ error: "Failed to delete image" }, 500);
    }
  })
  .get("/images", async (c) => {
    try {
      const prefix = c.req.query("prefix") || "uploads/";
      const objects = await listObjects(prefix);

      const images = await Promise.all(
        objects.map(async (obj: any) => {
          const url = await generatePresignedGetUrl(obj.Key);
          return {
            key: obj.Key,
            lastModified: obj.LastModified,
            size: obj.Size,
            url,
          };
        }),
      );

      return c.json({
        success: true,
        message: `retrieved ${images.length} images successfully`,
        data: images,
      });
    } catch (error) {
      throw new UploadError("error listing images", 500, {
        cause: error,
      });
    }
  })
  .post("/direct-server", zValidator("form", fileUploadSchema), async (c) => {
    try {
      const { file } = c.req.valid("form");

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.type || "image/jpeg";
      const fileName = `${Date.now()}-${file.name}`;

      const key = await directUpload(buffer, fileName, fileType);
      const url = await generatePresignedGetUrl(key);

      return c.json({
        success: true,
        message: "file uploaded successfully",
        data: {
          key,
          url,
        },
      });
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError("failed to upload file", 500, {
        cause: error,
      });
    }
  });
