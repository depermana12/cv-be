import { z } from "zod";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"] as const;

export const presignedUploadSchema = z.object({
  fileType: z
    .enum(ALLOWED_FILE_TYPES)
    .refine((type) => ALLOWED_FILE_TYPES.includes(type), {
      message: `file type not supported, only ${ALLOWED_FILE_TYPES.join(
        ", ",
      )} are allowed`,
    }),
  folder: z.string().optional().default("uploads"),
});

export const listObjectsSchema = z.object({
  prefix: z.string().optional().default("uploads/"),
});

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, {
      message: "file is required",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `file size too large, max size is ${MAX_FILE_SIZE / 1024}KB`,
    })
    .refine((file) => ALLOWED_FILE_TYPES.includes(file.type as any), {
      message: `file type not supported, only ${ALLOWED_FILE_TYPES.join(
        ", ",
      )} are allowed`,
    }),
  folder: z.string().optional().default("uploads"),
});
